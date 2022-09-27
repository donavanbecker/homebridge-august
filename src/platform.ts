import August from 'august-api';
import { API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, Service } from 'homebridge';
import { LockManagement } from './devices/lock';
import { AugustPlatformConfig, PLUGIN_NAME, PLATFORM_NAME, device } from './settings';

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
  debugMode!: boolean;
  platformLogging!: string;
  august: August;

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
      this.errorLog(e);
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
        this.errorLog(e);
      }
    });
  }

  logs() {
    this.debugMode = process.argv.includes('-D') || process.argv.includes('--debug');
    if (this.config.options?.logging === 'debug' || this.config.options?.logging === 'standard' || this.config.options?.logging === 'none') {
      this.platformLogging = this.config.options!.logging;
      if (this.platformLogging.includes('debug')) {
        this.log.warn(`Using Config Logging: ${this.platformLogging}`);
      }
    } else if (this.debugMode) {
      this.platformLogging = 'debugMode';
      if (this.platformLogging?.includes('debug')) {
        this.log.warn(`Using ${this.platformLogging} Logging`);
      }
    } else {
      this.platformLogging = 'standard';
      if (this.platformLogging?.includes('debug')) {
        this.log.warn(`Using ${this.platformLogging} Logging`);
      }
    }
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
    if (this.config.options.logging) {
      platformConfig['refreshRate'] = this.config.options.refreshRate;
    }
    if (this.config.options.logging) {
      platformConfig['pushRate'] = this.config.options.pushRate;
    }
    if (Object.entries(platformConfig).length !== 0) {
      this.warnLog(`Platform Config: ${JSON.stringify(platformConfig)}`);
    }

    if (!this.config.credentials) {
      throw new Error('Missing Credentials');
    }
    if (!this.config.credentials.validateCode) {
      this.warnLog(`Platform Config: ${JSON.stringify(platformConfig)}`);
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
   * Accessories are registered by either their DeviceClass, DeviceModel, or DeviceID
   */
  private async discoverDevices() {
    try {
      const uuid = this.api.hap.uuid.generate(`${this.config.credentials?.augustId}`);
      this.august = new August({
        installId: uuid,
        augustId: this.config.credentials?.augustId,
        password: this.config.credentials?.password,
      });
      this.warnLog(JSON.stringify(this.august));
      // If this is the first time you're using this installId, you need to authorize and validate:
      if (!this.config.credentials?.validateCode) {
        this.august.authorize();
      } else {
      // A 6-digit code will be sent to your email or phone (depending on what you used for your augustId). Send the code back:
        this.august.validate(this.config.credentials.validateCode); // Example code
      }

      // Example
      const myLocks = await this.august.locks();
      this.warnLog(JSON.stringify(myLocks));

      for(const device of myLocks) {
        const lockId = Object.keys(myLocks)[0];
        this.august.lock(lockId);
        this.warnLog(JSON.stringify(lockId));
        this.warnLog(JSON.stringify(device));
        this.debugLog(`Discovered ${device.LockName} (${lockId}) ${device.UserType} ${device.macAddress} ${device.macAddress} `
      + `@ ${device.HouseName} (${device.HouseID})`);
        this.createLock(device, uuid);
      }
    } catch (e: any) {
      this.errorLog(e);
    }
  }

  private async createLock(device: device, uuid) {

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      if (!this.config.disablePlugin) {
        this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName} DeviceID: ${device.lockId}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.displayName = device.lockDetails.LockName;
        existingAccessory.context.firmwareRevision = this.version;
        existingAccessory.context.device = device;
        existingAccessory.context.deviceID = device.lockId;
        //existingAccessory.context.model = device.deviceModel;
        this.api.updatePlatformAccessories([existingAccessory]);
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new LockManagement(this, existingAccessory, device);
        this.debugLog(`${device.lockDetails.LockName} (${device.lockId}) uuid: ${existingAccessory.UUID}`);
      } else {
        this.unregisterPlatformAccessories(existingAccessory);
      }
    } else if (!this.config.disablePlugin) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(`Adding new accessory: ${device.lockDetails.LockName} Lock ID: ${device.lockId}`);

      // create a new accessory
      const accessory = new this.api.platformAccessory(device.lockDetails.LockName, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.firmwareRevision = this.version;
      accessory.context.device = device;
      accessory.context.deviceID = device.lockId;
      //accessory.context.model = device.deviceModel;
      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      new LockManagement(this, accessory, device);
      this.debugLog(`${device.lockDetails.LockName} (${device.lockId}) uuid:  ${accessory.UUID}`);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(`Unable to Register new device: ${device.lockDetails.LockName} ${device.lockId} Lock ID: ${device.lockId}`);
        this.errorLog('Check Config to see if DeviceID is being Hidden.');
      }
    }
  }

  public unregisterPlatformAccessories(existingAccessory: PlatformAccessory) {
    // remove platform accessories when no longer present
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
    this.warnLog(`Removing existing accessory from cache: ${existingAccessory.displayName}`);
  }

  public locationinfo(location) {
    if (this.platformLogging?.includes('debug')) {
      if (location) {
        this.warnLog(JSON.stringify(location));
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

  errorLog(...log: any[]) {
    if (this.enablingPlatfromLogging()) {
      this.log.error(String(...log));
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
