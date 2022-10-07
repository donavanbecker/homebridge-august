import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import { interval, Subject } from 'rxjs';
import { debounceTime, skipWhile, take, tap } from 'rxjs/operators';
import { AugustPlatform } from '../platform';
import superStringify from 'super-stringify';
import { device, devicesConfig } from '../settings';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class LockMechanism {
  lockService!: Service;
  contactSensorService?: Service;
  batteryService: Service;


  // CharacteristicValue
  LockTargetState!: CharacteristicValue;
  LockCurrentState!: CharacteristicValue;
  BatteryLevel!: CharacteristicValue;
  StatusLowBattery!: CharacteristicValue;
  ContactSensorState!: CharacteristicValue;

  // Lock Status
  lockStatus: any;
  lockState: any;
  retryCount: any;
  status: any;
  state: any;
  locked!: boolean;
  unlocked!: boolean;
  open!: boolean;
  closed!: boolean;

  // Lock Details
  lockDetails: any;
  battery: any;
  doorState: any;
  currentFirmwareVersion: any;

  // Config
  deviceLogging!: string;
  deviceRefreshRate!: number;

  // Lock Updates
  lockUpdateInProgress: boolean;
  doLockUpdate: any;

  constructor(private readonly platform: AugustPlatform, private accessory: PlatformAccessory, public device: device & devicesConfig) {
    this.logs(device);
    this.refreshRate(device);
    this.config(device);
    this.cacheState();

    // default placeholders
    // this is subject we use to track when we need to POST changes to the August API
    this.doLockUpdate = new Subject();
    this.lockUpdateInProgress = false;

    // Initial Device Parse
    this.refreshStatus();

    // set accessory information
    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'August Home Inc.')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.serialnumber)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, accessory.context.currentFirmwareVersion)
      .getCharacteristic(this.platform.Characteristic.FirmwareRevision)
      .updateValue(accessory.context.currentFirmwareVersion);

    // Lock Mechanism Service
    (this.lockService =
      this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism)),
    accessory.displayName;

    // Service Name
    this.lockService.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);
    //Required Characteristics" see https://developers.homebridge.io/#/service/LockMechanism


    // Create handlers for required characteristics
    this.lockService.getCharacteristic(this.platform.Characteristic.LockTargetState).onSet(this.setLockTargetState.bind(this));

    // Contact Sensor Service
    if (device.lock?.hide_contactsensor) {
      this.warnLog(`Lock: ${accessory.displayName} Removing Contact Sensor Service`);
      this.contactSensorService = this.accessory.getService(this.platform.Service.ContactSensor);
      accessory.removeService(this.contactSensorService!);
    } else if (!this.contactSensorService) {
      this.debugLog(`Lock: ${accessory.displayName} Add Contact Sensor Service`);
      (this.contactSensorService =
        this.accessory.getService(this.platform.Service.ContactSensor) || this.accessory.addService(this.platform.Service.ContactSensor)),
      `${accessory.displayName} Contact Sensor`;

      this.contactSensorService.setCharacteristic(this.platform.Characteristic.Name, `${accessory.displayName} Contact Sensor`);
    } else {
      this.warnLog(`Lock: ${accessory.displayName} Contact Sensor Service Not Added`);
    }

    // Battery Service
    (this.batteryService =
      this.accessory.getService(this.platform.Service.Battery) || this.accessory.addService(this.platform.Service.Battery)),
    `${accessory.displayName} Battery`;

    // Retrieve initial values and updateHomekit
    this.updateHomeKitCharacteristics();

    // Subscribe to august changes
    this.subscribeAugust();

    // Start an update interval
    interval(this.deviceRefreshRate * 1000)
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
        // Refresh the status from the API
        interval(this.deviceRefreshRate * 500)
          .pipe(skipWhile(() => this.lockUpdateInProgress))
          .pipe(take(1))
          .subscribe(async () => {
            await this.refreshStatus();
          });
        this.lockUpdateInProgress = false;
      });
  }

  /**
   * Parse the device status from the August api
   */
  async parseStatus(): Promise<void> {
    this.debugLog(`Lock: ${this.accessory.displayName} parseStatus`);
    // Lock Mechanism
    if (this.retryCount > 1) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.JAMMED;
    } else if (this.locked) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
    } else if (this.unlocked) {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
    } else {
      this.LockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
      this.refreshStatus();
    }
    // Battery
    this.BatteryLevel = Number(this.battery);
    this.batteryService.getCharacteristic(this.platform.Characteristic.BatteryLevel).updateValue(this.BatteryLevel);
    if (this.BatteryLevel < 15) {
      this.StatusLowBattery = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
    } else {
      this.StatusLowBattery = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
    }
    this.debugLog(`Lock: ${this.accessory.displayName} BatteryLevel: ${this.BatteryLevel},` + ` StatusLowBattery: ${this.StatusLowBattery}`);
    // Contact Sensor
    if (this.open) {
      this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
      this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
    } else if (this.closed) {
      this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
      this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
    } else if (this.doorState === 'open') {
      this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
      this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
    } else if (this.doorState === 'closed') {
      this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
      this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
    } else {
      this.errorLog(`Lock: ${this.accessory.displayName} doorState: ${this.doorState}, closed: ${this.closed}, open: ${this.open}`);
    }
    // Update Firmware
    if (this.currentFirmwareVersion !== this.accessory.context.currentFirmwareVersion) {
      this.warnLog(`Lock: ${this.accessory.displayName} Firmware Version changed to Current Firmware Version: ${this.currentFirmwareVersion}`);
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.currentFirmwareVersion)
      .getCharacteristic(this.platform.Characteristic.FirmwareRevision)
      .updateValue(this.currentFirmwareVersion);
    }
  }

  /**
   * Asks the August Home API for the latest device information
   */
  async refreshStatus(): Promise<void> {
    try {
      // Update Lock Status
      const lockStatus = await this.platform.august.status(this.device.lockId);
      this.debugLog(`Lock: ${this.accessory.displayName} lockStatus (refreshStatus): ${superStringify(lockStatus)}`);
      this.retryCount = lockStatus.retryCount;
      this.state = lockStatus.state;
      this.locked = lockStatus.state.locked;
      this.unlocked = lockStatus.state.unlocked;
      this.open = lockStatus.state.open;
      this.closed = lockStatus.state.closed;

      // Update Lock Details
      const lockDetails = await this.platform.august.details(this.device.lockId);
      this.debugLog(`Lock: ${this.accessory.displayName} lockDetails (refreshStatus): ${superStringify(lockDetails)}`);
      this.doorState = lockDetails.LockStatus.doorState;
      this.battery = (Number(lockDetails.battery) * 100).toFixed();
      this.debugLog(`Lock: ${this.accessory.displayName} battery (lockDetails): ${this.battery}`);
      this.currentFirmwareVersion = lockDetails.currentFirmwareVersion;
      this.debugLog(`Lock: ${this.accessory.displayName} currentFirmwareVersion (lockDetails): ${this.currentFirmwareVersion}`);

      // Update HomeKit
      this.parseStatus();
      this.updateHomeKitCharacteristics();
    } catch (e: any) {
      this.errorLog(e);
      this.errorLog(`Lock: ${this.accessory.displayName} failed lockStatus (refreshStatus), Error Message: ${superStringify(e.message)}`);
    }
  }

  /**
   * Pushes the requested changes to the August API
   */
  async pushChanges(): Promise<void> {
    try {
      if (this.LockTargetState === this.platform.Characteristic.LockTargetState.UNSECURED) {
        await this.platform.august.unlock(this.device.lockId, (AugustEvent: any, timestamp: any) => {
          this.debugLog(`Lock: ${this.accessory.displayName} AugustEvent (pushChanges): ${superStringify(AugustEvent), superStringify(timestamp)}`);
          this.infoLog(`Lock: ${this.accessory.displayName} Sending request to August API: Unlock (${this.LockTargetState})`);
        });
      } else if (this.LockTargetState === this.platform.Characteristic.LockTargetState.SECURED) {
        await this.platform.august.lock(this.device.lockId, (AugustEvent: any, timestamp: any) => {
          this.debugLog(`Lock: ${this.accessory.displayName} AugustEvent (pushChanges): ${superStringify(AugustEvent), superStringify(timestamp)}`);
          this.infoLog(`Lock: ${this.accessory.displayName} Sending request to August API: Lock (${this.LockTargetState})`);
        });
      } else {
        this.errorLog(`Lock: ${this.accessory.displayName} lockStatus (pushChanges) failed, this.LockTargetState: ${this.LockTargetState}`);
      }
    } catch (e: any) {
      this.errorLog(e);
      this.errorLog(`Lock: ${this.accessory.displayName} failed pushChanges, Error Message: ${superStringify(e.message)}`);
    }
  }

  /**
   * Updates the status for each of the HomeKit Characteristics
   */
  async updateHomeKitCharacteristics(): Promise<void> {
    // Lock Mechanism
    if (this.LockTargetState === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} LockTargetState: ${this.LockTargetState}`);
    } else {
      this.accessory.context.LockCurrentState = this.LockTargetState;
      this.lockService.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.LockTargetState);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic LockTargetState: ${this.LockTargetState}`);
    }
    if (this.LockCurrentState === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} LockCurrentState: ${this.LockCurrentState}`);
    } else {
      this.accessory.context.LockCurrentState = this.LockCurrentState;
      this.lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.LockCurrentState);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic LockCurrentState: ${this.LockCurrentState}`);
    }
    // Battery
    if (this.BatteryLevel === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} BatteryLevel: ${this.BatteryLevel}`);
    } else {
      this.accessory.context.BatteryLevel = this.BatteryLevel;
      this.batteryService.updateCharacteristic(this.platform.Characteristic.BatteryLevel, this.BatteryLevel);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic BatteryLevel: ${this.BatteryLevel}`);
    }
    if (this.StatusLowBattery === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} StatusLowBattery: ${this.StatusLowBattery}`);
    } else {
      this.accessory.context.StatusLowBattery = this.StatusLowBattery;
      this.batteryService.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.StatusLowBattery);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic StatusLowBattery: ${this.StatusLowBattery}`);
    }
    // Contact Sensor
    if (this.ContactSensorState === undefined) {
      this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
    } else {
      this.accessory.context.ContactSensorState = this.ContactSensorState;
      this.contactSensorService?.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.ContactSensorState);
      this.debugLog(`Lock: ${this.accessory.displayName} updateCharacteristic ContactSensorState: ${this.ContactSensorState}`);
    }
  }

  async setLockTargetState(value: CharacteristicValue): Promise<void> {
    this.debugLog(`Lock: ${this.accessory.displayName} Set LockTargetState: ${value}`);
    this.LockTargetState = value;
    this.accessory.context.LockTargetState = this.LockTargetState;
    this.doLockUpdate.next();
  }

  async subscribeAugust(): Promise<void> {
    await this.platform.august.subscribe(this.device.lockId, (AugustEvent: any, timestamp: any) => {
      this.debugLog(`Lock: ${this.accessory.displayName} AugustEvent: ${superStringify(AugustEvent), superStringify(timestamp)}`);
      //LockCurrentState
      if (AugustEvent.state.unlocked) {
        this.LockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
      } else if (AugustEvent.state.locked) {
        this.LockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
      } else {
        this.refreshStatus();
      }
      // Contact Sensor
      if (AugustEvent.state.open) {
        this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
      } else if (AugustEvent.state.closed) {
        this.ContactSensorState = this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        this.debugLog(`Lock: ${this.accessory.displayName} ContactSensorState: ${this.ContactSensorState}`);
      } else {
        this.refreshStatus();
      }
      // Update HomeKit
      this.updateHomeKitCharacteristics();
    });
  }


  async cacheState() {
    if (this.LockCurrentState === undefined) {
      this.LockCurrentState = this.accessory.context.LockCurrentState | this.platform.Characteristic.LockCurrentState.SECURED;
    }
    if (this.LockTargetState === undefined) {
      this.LockTargetState = this.accessory.context.LockTargetState | this.platform.Characteristic.LockTargetState.SECURED;
    }
    if (this.ContactSensorState === undefined) {
      this.ContactSensorState = this.accessory.context.ContactSensorState | this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    }
    if (this.BatteryLevel === undefined) {
      this.BatteryLevel = this.accessory.context.BatteryLevel || 100;
    }
    if (this.StatusLowBattery === undefined) {
      if (this.BatteryLevel < 15) {
        this.StatusLowBattery = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
      } else {
        this.StatusLowBattery = this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
      }
    }
  }

  async config(device: device & devicesConfig): Promise<void> {
    let config = {};
    if (device.lock) {
      config = '';
    }
    if (device.logging !== undefined) {
      config['logging'] = device.logging;
    }
    if (device.refreshRate !== undefined) {
      config['refreshRate'] = device.refreshRate;
    }
    if (Object.entries(config).length !== 0) {
      this.warnLog(`Lock: ${this.accessory.displayName} Config: ${superStringify(config)}`);
    }
  }

  async refreshRate(device: device & devicesConfig): Promise<void> {
    if (device.refreshRate) {
      this.deviceRefreshRate = this.accessory.context.refreshRate = device.refreshRate;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Device Config refreshRate: ${this.deviceRefreshRate}`);
    } else if (this.platform.config.options!.refreshRate) {
      this.deviceRefreshRate = this.accessory.context.refreshRate = this.platform.config.options!.refreshRate;
      this.debugLog(`Lock: ${this.accessory.displayName} Using Platform Config refreshRate: ${this.deviceRefreshRate}`);
    }
  }

  async logs(device: device & devicesConfig): Promise<void> {
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