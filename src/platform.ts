import August from 'august-api';
import superStringify from 'super-stringify';
import { API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, Service } from 'homebridge';
import { LockMechanism } from './devices/lock';
import { AugustPlatformConfig, PLUGIN_NAME, PLATFORM_NAME, device, devicesConfig } from './settings';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class AugustPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  version = require('../package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires
  august: August;
  account: any;
  debugMode!: boolean;
  platformLogging!: string;
  registeringDevice!: boolean;

  constructor(public readonly log: Logger, public readonly config: AugustPlatformConfig, public readonly api: API) {
    this.logs();
    this.debugLog(`Finished initializing platform: ${this.config.name}`);
    // only load if configured
    if (!this.config) {
      return;
    }

    // HOOBS notice
    if (__dirname.includes('hoobs')) {
      this.warnLog('This plugin has not been tested under HOOBS, it is highly recommended that ' + 'you switch to Homebridge: https://git.io/Jtxb0');
    }

    // verify the config
    try {
      this.verifyConfig();
      this.debugLog('Config OK');
    } catch (e: any) {
      this.errorLog(`Verify Config: ${e}`);
      return;
    }

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      this.debugLog('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      try {
        this.discoverDevices();
      } catch (e: any) {
        this.errorLog(`Discover Devices: ${e}`);
      }
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.debugLog(`Loading accessory from cache: ${accessory.displayName}`);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * Verify the config passed to the plugin is valid
   */
  verifyConfig() {
    this.config.options = this.config.options || {};

    const platformConfig = {};
    if (this.config.options.logging) {
      platformConfig['logging'] = this.config.options.logging;
    }
    if (this.config.options.logging && this.config.options.refreshRate) {
      platformConfig['refreshRate'] = this.config.options.refreshRate;
    }
    if (this.config.options.logging && this.config.options.pushRate) {
      platformConfig['pushRate'] = this.config.options.pushRate;
    }
    if (Object.entries(platformConfig).length !== 0) {
      this.infoLog(`Platform Config: ${superStringify(platformConfig)}`);
    }

    if (!this.config.options.refreshRate) {
      // default 1800 seconds (30 minutes)
      this.config.options!.refreshRate! = 1800;
      if (this.platformLogging?.includes('debug')) {
        this.debugLog('Using Default Refresh Rate (5 minutes).');
      }
    }

    if (!this.config.credentials) {
      throw new Error('Missing Credentials');
    }
    if (!this.config.credentials.validateCode) {
      this.warnLog(`Platform Config: ${superStringify(platformConfig)}`);
    }
    if (!this.config.credentials.augustId) {
      throw new Error('Missing August ID (E-mail/Phone Number');
    }
    if (!this.config.credentials.password) {
      throw new Error('Missing August Password');
    }
  }

  /**
   * This method is used to discover the your location and devices.
   */
  private async discoverDevices() {
    try {
      const uuid = this.api.hap.uuid.generate(`${this.config.credentials?.augustId}`);
      this.account = {
        installId: uuid,
        augustId: this.config.credentials?.augustId,
        password: this.config.credentials?.password,
      };
      this.august = new August(this.account);
      this.debugLog(superStringify(this.august));
      if (this.config.credentials?.validateCode) {
      // A 6-digit code will be sent to your email or phone (depending on what you used for your augustId). Send the code back:
        this.august.validate(this.config.credentials.validateCode);
      } else {
        // If this is the first time you're using this installId, you need to authorize and validate:
        this.august.authorize();
      }

      // August Locks
      const devices = await this.august.details();
      let deviceLists: any[];
      if (devices.length > 1) {
        deviceLists = devices;
        this.infoLog(`Total August Locks Found: ${deviceLists.length}`);
      } else {
        deviceLists = [devices];
        this.infoLog(`Total August Locks Found: ${deviceLists.length}`);
      }
      if (!this.config.options?.devices) {
        if (this.platformLogging.includes('debug')) {
          this.debugLog(`August Platform Config Not Set: ${superStringify(this.config.options?.devices)}`);
        }
        const devices = deviceLists.map((v: any) => v);
        for (const device of devices) {
          if (device.configDeviceName) {
            device.deviceName = device.configDeviceName;
          }
          this.debugLog(`device: ${superStringify(device)}`);
          this.createLock(device);
        }
      } else if (this.config.options.devices) {
        if (this.platformLogging.includes('debug')) {
          this.warnLog(`August Platform Config Set: ${superStringify(this.config.options?.devices)}`);
        }
        const deviceConfigs = this.config.options?.devices;

        const mergeBylockId = (a1: { lockId: string }[], a2: any[]) =>
          a1.map((itm: { lockId: string }) => ({
            ...a2.find(
              (item: { lockId: string }) =>
                item.lockId.toUpperCase().replace(/[^A-Z0-9]+/g, '') === itm.lockId.toUpperCase().replace(/[^A-Z0-9]+/g, '') && item,
            ),
            ...itm,
          }));
        const devices = mergeBylockId(deviceLists, deviceConfigs);
        this.debugLog(`August Lock(s): ${superStringify(devices)}`);
        for (const device of devices) {
          if (device.configDeviceName) {
            device.deviceName = device.configDeviceName;
          }
          this.debugLog(`device: ${superStringify(device)}`);
          this.createLock(device);
        }
      } else {
        this.errorLog('August ID & Password Supplied, Issue with Auth.');
      }
    } catch (e: any) {
      this.errorLog(`Discover Devices: ${e}`);
    }
  }

  private async createLock(device: device & devicesConfig) {
    const uuid = this.api.hap.uuid.generate(device.lockId);
    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

    if (existingAccessory) {

      // the accessory already exists
      if (this.registerDevice(device)) {
        this.infoLog(`Restoring existing accessory from cache: ${device.LockName} Lock ID: ${device.lockId}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.context.device = device;
        existingAccessory.displayName = device.LockName;
        existingAccessory.context.currentFirmwareVersion = device.currentFirmwareVersion;
        existingAccessory.context.model = device.skuNumber;
        existingAccessory.context.serialnumber = device.SerialNumber;
        existingAccessory.context.lockId = device.lockId;
        this.api.updatePlatformAccessories([existingAccessory]);
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new LockMechanism(this, existingAccessory, device);
        this.debugLog(`${device.LockName} (${device.lockId}) uuid: ${existingAccessory.UUID}`);
      } else {
        this.unregisterPlatformAccessories(existingAccessory, device);
      }
    } else if (this.registerDevice(device)) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(`Adding new accessory: ${device.LockName} Lock ID: ${device.lockId}`);

      // create a new accessory
      const accessory = new this.api.platformAccessory(device.LockName, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.device = device;
      accessory.displayName = device.LockName;
      accessory.context.currentFirmwareVersion = device.currentFirmwareVersion;
      accessory.context.model = device.skuNumber;
      accessory.context.serialnumber = device.SerialNumber;
      accessory.context.lockId = device.lockId;
      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      new LockMechanism(this, accessory, device);
      this.debugLog(`${device.LockName} (${device.lockId}) uuid:  ${accessory.UUID}`);

      // link the accessory to your platform
      this.externalOrPlatform(device, accessory);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(`Unable to Register new device: ${device.LockName} Lock ID: ${device.lockId}`);
        this.errorLog('Check Config to see if lockId is being Hidden.');
      }
    }
  }

  private registerDevice(device: device & devicesConfig) {
    if (!device.hide_device && !this.config.disablePlugin) {
      this.registeringDevice = true;
      this.debugLog(`Device: ${device.LockName} Enabled`);
    } else {
      this.registeringDevice = false;
      this.debugLog(`Device: ${device.LockName} Plugin or Device Disabled`);
    }
    return this.registeringDevice;
  }

  public async externalOrPlatform(device: device & devicesConfig, accessory: PlatformAccessory) {
    if (device.external) {
      this.infoLog(`${accessory.displayName} External Accessory Mode: ${device.external}`);
      this.externalAccessory(accessory);
    } else {
      this.debugLog(`${accessory.displayName} External Accessory Mode: ${device.external}`);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  public async externalAccessory(accessory: PlatformAccessory) {
    this.api.publishExternalAccessories(PLUGIN_NAME, [accessory]);
  }

  public unregisterPlatformAccessories(existingAccessory: PlatformAccessory, device: device & devicesConfig) {
    // remove platform accessories when no longer present
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
    this.warnLog(`Removing existing accessory from cache: ${device.LockName}`);
  }

  logs() {
    this.debugMode = process.argv.includes('-D') || process.argv.includes('--debug');
    if (this.config.options?.logging === 'debug' || this.config.options?.logging === 'standard' || this.config.options?.logging === 'none') {
      this.platformLogging = this.config.options!.logging;
      if (this.platformLogging.includes('debug')) {
        this.debugWarnLog(`Using Config Logging: ${this.platformLogging}`);
      }
    } else if (this.debugMode) {
      this.platformLogging = 'debugMode';
      if (this.platformLogging?.includes('debug')) {
        this.debugWarnLog(`Using ${this.platformLogging} Logging`);
      }
    } else {
      this.platformLogging = 'standard';
      if (this.platformLogging?.includes('debug')) {
        this.debugWarnLog(`Using ${this.platformLogging} Logging`);
      }
    }
  }

  /**
   * If device level logging is turned on, log to log.warn
   * Otherwise send debug logs to log.debug
   */
  infoLog(...log: any[]) {
    if (this.enablingPlatfromLogging()) {
      this.log.info(String(...log));
    }
  }

  warnLog(...log: any[]) {
    if (this.enablingPlatfromLogging()) {
      this.log.warn(String(...log));
    }
  }

  debugWarnLog(...log: any[]): void {
    if (this.enablingPlatfromLogging()) {
      if (this.platformLogging?.includes('debug')) {
        this.log.warn('[DEBUG]', String(...log));
      }
    }
  }

  errorLog(...log: any[]) {
    if (this.enablingPlatfromLogging()) {
      this.log.error(String(...log));
    }
  }

  debugErrorLog(...log: any[]): void {
    if (this.enablingPlatfromLogging()) {
      if (this.platformLogging?.includes('debug')) {
        this.log.error('[DEBUG]', String(...log));
      }
    }
  }

  debugLog(...log: any[]) {
    if (this.enablingPlatfromLogging()) {
      if (this.platformLogging === 'debugMode') {
        this.log.debug(String(...log));
      } else if (this.platformLogging === 'debug') {
        this.log.info('[DEBUG]', String(...log));
      }
    }
  }

  enablingPlatfromLogging(): boolean {
    return this.platformLogging?.includes('debug') || this.platformLogging === 'standard';
  }
}
