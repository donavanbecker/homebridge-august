import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import { interval, Subject } from 'rxjs';
import { debounceTime, skipWhile, take, tap } from 'rxjs/operators';
import { AugustPlatform } from '../platform';
import { device } from '../settings';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class LockManagement {
  service!: Service;
  batteryService: Service;


  // CharacteristicValue
  LockTargetState!: CharacteristicValue;
  LockCurrentState!: CharacteristicValue;

  // Others
  lockStatus: any;

  // Config
  deviceLogging!: string;
  deviceRefreshRate!: number;

  // Lock Updates
  lockUpdateInProgress: boolean;
  doLockUpdate: any;

  constructor(private readonly platform: AugustPlatform, private accessory: PlatformAccessory, public device: device) {
    this.logs(device);
    this.refreshRate(device);
    this.config(device);

    // default placeholders
    // this is subject we use to track when we need to POST changes to the August API
    this.doLockUpdate = new Subject();
    this.lockUpdateInProgress = false;

    // set accessory information
    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'August')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.serialnumber)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, accessory.context.firmwareRevision)
      .getCharacteristic(this.platform.Characteristic.FirmwareRevision)
      .updateValue(accessory.context.firmwareRevision);

    //LockManagement Service
    (this.service =
      this.accessory.getService(this.platform.Service.LockManagement) || this.accessory.addService(this.platform.Service.LockManagement)),
    accessory.displayName;

    //Service Name
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);
    //Required Characteristics" see https://developers.homebridge.io/#/service/LockMechanism

    //Initial Device Parse
    this.parseStatus();

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState).onSet(this.setLockTargetState.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).onGet(() => {
      return this.LockCurrentState!;
    });

    (this.batteryService =
      this.accessory.getService(this.platform.Service.Battery) || this.accessory.addService(this.platform.Service.Battery)),
    `${accessory.displayName} Battery`;

    // Retrieve initial values and updateHomekit
    this.refreshStatus();
    this.updateHomeKitCharacteristics();

    // Start an update interval
    interval(this.platform.config.options!.refreshRate! * 1000)
      .pipe(skipWhile(() => this.lockUpdateInProgress))
      .subscribe(async () => {
        await this.refreshStatus();
      });

    // Watch for Lock change events
    // We put in a debounce of 100ms so we don't make duplicate calls
    this.doLockUpdate
      .pipe(
        tap(() => {
          this.lockUpdateInProgress = true;
        }),
        debounceTime(this.platform.config.options!.pushRate! * 1000),
      )
      .subscribe(async () => {
        try {
          await this.pushChanges();
        } catch (e: any) {
          this.errorLog(e);
        }
        this.lockUpdateInProgress = false;
        // Refresh the status from the API
        interval(15000)
          .pipe(skipWhile(() => this.lockUpdateInProgress))
          .pipe(take(1))
          .subscribe(async () => {
            await this.refreshStatus();
          });
      });
  }

  /**
   * Parse the device status from the August api
   */
  async parseStatus(): Promise<void> {
    /*if (this.lockStatus.retryCount) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.JAMMED;
    } else if (this.lockStatus.state.locked) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
    } else if (this.lockStatus.state.unlocked) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
    } else {*/
    this.LockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    //}
    this.debugLog(`Lock: ${this.accessory.displayName} parseStatus`);
  }

  /**
   * Asks the August Home API for the latest device information
   */
  async refreshStatus(): Promise<void> {
    try {
      const august = this.platform.august;
      const lockStatus = await august.status(this.device.lockId);
      this.debugLog(JSON.stringify(lockStatus));
      this.lockStatus = lockStatus;
      this.debugLog(`Lock: ${this.accessory.displayName} device: ${JSON.stringify(this.device)}`);
      this.parseStatus();
      this.updateHomeKitCharacteristics();
    } catch (e: any) {
      this.errorLog(e);
    }
  }

  /**
   * Pushes the requested changes to the August API
   */
  async pushChanges(): Promise<void> {
    try {
      // Attempt to make the API request
      this.debugLog(`Lock: ${this.accessory.displayName} pushChanges: ${JSON.stringify(this.device)}`);
    } catch (e: any) {
      this.errorLog(e);
    }
  }

  /**
   * Updates the status for each of the HomeKit Characteristics
   */
  async updateHomeKitCharacteristics(): Promise<void> {
    if (this.LockTargetState === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} LockTargetState: ${this.LockTargetState}`);
    } else {
      this.service.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.LockTargetState);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic LockTargetState: ${this.LockTargetState}`);
    }
  }

  async setLockTargetState(value: CharacteristicValue): Promise<void> {
    this.debugLog(`Lock: ${this.accessory.displayName} Set LockTargetState: ${value}`);
    this.LockTargetState = value;
    this.doLockUpdate.next();
  }

  async config(device): Promise<void> {
    let config = {};
    if (device.thermostat) {
      config = device.thermostat;
    }
    if (device.logging !== undefined) {
      config['logging'] = device.logging;
    }
    if (device.refreshRate !== undefined) {
      config['refreshRate'] = device.refreshRate;
    }
    if (Object.entries(config).length !== 0) {
      this.warnLog(`Lock: ${this.accessory.displayName} Config: ${JSON.stringify(config)}`);
    }
  }

  async refreshRate(device): Promise<void> {
    if (device.refreshRate) {
      this.deviceRefreshRate = this.accessory.context.refreshRate = device.refreshRate;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Device Config refreshRate: ${this.deviceRefreshRate}`);
    } else if (this.platform.config.options!.refreshRate) {
      this.deviceRefreshRate = this.accessory.context.refreshRate = this.platform.config.options!.refreshRate;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Platform Config refreshRate: ${this.deviceRefreshRate}`);
    }
  }

  async logs(device): Promise<void> {
    if (this.platform.debugMode) {
      this.deviceLogging = this.accessory.context.logging = 'debugMode';
      this.debugLog(`Lock: ${this.accessory.displayName} Using Debug Mode Logging: ${this.deviceLogging}`);
    } else if (device.logging) {
      this.deviceLogging = this.accessory.context.logging = device.logging;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Device Config Logging: ${this.deviceLogging}`);
    } else if (this.platform.config.options?.logging) {
      this.deviceLogging = this.accessory.context.logging = this.platform.config.options?.logging;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Platform Config Logging: ${this.deviceLogging}`);
    } else {
      this.deviceLogging = this.accessory.context.logging = 'standard';
      this.debugLog(`Lock: ${this.accessory.displayName} Logging Not Set, Using: ${this.deviceLogging}`);
    }
  }

  /**
   * Logging for Device
   */
  infoLog(...log: any[]): void {
    if (this.enablingDeviceLogging()) {
      this.platform.log.info(String(...log));
    }
  }

  warnLog(...log: any[]): void {
    if (this.enablingDeviceLogging()) {
      this.platform.log.warn(String(...log));
    }
  }

  errorLog(...log: any[]): void {
    if (this.enablingDeviceLogging()) {
      this.platform.log.error(String(...log));
    }
  }

  debugLog(...log: any[]): void {
    if (this.enablingDeviceLogging()) {
      if (this.deviceLogging === 'debug') {
        this.platform.log.info('[DEBUG]', String(...log));
      } else {
        this.platform.log.debug(String(...log));
      }
    }
  }

  enablingDeviceLogging(): boolean {
    return this.deviceLogging.includes('debug') || this.deviceLogging === 'standard';
  }
}
