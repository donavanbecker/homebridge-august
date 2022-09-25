import August from 'august-api';
import { API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, Service } from 'homebridge';
import { LeakSensor } from './devices/leaksensors';
import { Thermostats } from './devices/thermostats';
import * as settings from './settings';

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

  locations?: any;
  firmware!: settings.accessoryAttribute['softwareRevision'];
  sensorAccessory!: settings.sensorAccessory;
  version = require('../package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires

  public sensorData = [];
  debugMode!: boolean;
  action!: string;
  platformLogging!: string;

  constructor(public readonly log: Logger, public readonly config: settings.AugustPlatformConfig, public readonly api: API) {
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

    if (this.config.options) {
      // Device Config
      if (this.config.options.devices) {
        for (const deviceConfig of this.config.options.devices!) {
          if (!deviceConfig.hide_device && !deviceConfig.deviceClass) {
            throw new Error('The devices config section is missing the "Device Type" in the config, Check Your Conifg.');
          }
          if (!deviceConfig.deviceID) {
            throw new Error('The devices config section is missing the "Device ID" in the config, Check Your Conifg.');
          }
        }
      }
    }

    if (this.config.options!.refreshRate! < 30) {
      throw new Error('Refresh Rate must be above 30 seconds.');
    }

    if (this.config.disablePlugin) {
      this.errorLog('Plugin is disabled.');
    }

    if (!this.config.options.refreshRate && !this.config.disablePlugin) {
      // default 120 seconds (2 minutes)
      this.config.options!.refreshRate! = 120;
      if (this.platformLogging?.includes('debug')) {
        this.warnLog('Using Default Refresh Rate of 2 Minutes.');
      }
    }

    if (!this.config.options.pushRate && !this.config.disablePlugin) {
      // default 100 milliseconds
      this.config.options!.pushRate! = 0.1;
      if (this.platformLogging?.includes('debug')) {
        this.warnLog('Using Default Push Rate.');
      }
    }

    if (!this.config.credentials) {
      throw new Error('Missing Credentials');
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
    const august = new August({
      installId: 'uniqueId', // Can be anything, but save it for future use on this account
      augustId: 'yourEmailOrPhone', // Phone must be formatted +[countrycode][number]
      password: 'yourPassword',
    });
    this.warnLog(august);

  }

  private async deviceClass(device: settings.device & settings.devicesConfig, location: any, locationId: any) {
    switch (device.deviceClass) {
      case 'LeakDetector':
        this.debugLog(`Discovered ${device.userDefinedDeviceName} ${device.deviceClass} @ ${location.name}`);
        this.Leak(device, locationId);
        break;
      case 'Thermostat':
        this.debugLog(`Discovered ${device.userDefinedDeviceName} ${device.deviceClass} (${device.deviceModel}) @ ${location.name}`);
        await this.createThermostat(location, device, locationId);
        break;
      default:
        this.infoLog(`Device: ${device.userDefinedDeviceName} with Device Class: ${device.deviceClass} is currently not supported.`);
        this.infoLog('Submit Feature Requests Here: https://git.io/JURLY');
    }
  }

  private async createThermostat(
    location: settings.location,
    device: settings.device & settings.devicesConfig,
    locationId: settings.location['locationID'],
  ) {
    const uuid = this.api.hap.uuid.generate(`${device.deviceID}-${device.deviceClass}`);

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      if (!device.hide_device && !this.config.disablePlugin) {
        this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName} DeviceID: ${device.deviceID}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.displayName = device.userDefinedDeviceName;
        existingAccessory.context.firmwareRevision = this.version;
        existingAccessory.context.device = device;
        existingAccessory.context.deviceID = device.deviceID;
        existingAccessory.context.model = device.deviceModel;
        this.api.updatePlatformAccessories([existingAccessory]);
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new Thermostats(this, existingAccessory, locationId, device);
        this.debugLog(`${device.deviceClass} uuid: ${device.deviceID}-${device.deviceClass} (${existingAccessory.UUID})`);
      } else {
        this.unregisterPlatformAccessories(existingAccessory);
      }
    } else if (!device.hide_device && !this.config.disablePlugin) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(`Adding new accessory: ${device.userDefinedDeviceName} ${device.deviceClass} Device ID: ${device.deviceID}`);

      // create a new accessory
      const accessory = new this.api.platformAccessory(device.userDefinedDeviceName, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.firmwareRevision = this.version;
      accessory.context.device = device;
      accessory.context.deviceID = device.deviceID;
      accessory.context.model = device.deviceModel;
      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      new Thermostats(this, accessory, locationId, device);
      this.debugLog(`${device.deviceClass} uuid: ${device.deviceID}-${device.deviceClass} (${accessory.UUID})`);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(`Unable to Register new device: ${device.userDefinedDeviceName} ${device.deviceModel} ` + `DeviceID: ${device.deviceID}`);
        this.errorLog('Check Config to see if DeviceID is being Hidden.');
      }
    }
  }

  private Leak(device: settings.device & settings.devicesConfig, locationId: settings.location['locationID']) {
    const uuid = this.api.hap.uuid.generate(`${device.deviceID}-${device.deviceClass}`);

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      if (!device.hide_device && !this.config.disablePlugin) {
        this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName} DeviceID: ${device.deviceID}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.displayName = device.userDefinedDeviceName;
        existingAccessory.context.deviceID = device.deviceID;
        existingAccessory.context.model = device.deviceClass;
        existingAccessory.context.firmwareRevision = this.version;
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new LeakSensor(this, existingAccessory, locationId, device);
        this.debugLog(`${device.deviceClass} uuid: ${device.deviceID}-${device.deviceClass} (${existingAccessory.UUID})`);
      } else {
        this.unregisterPlatformAccessories(existingAccessory);
      }
    } else if (!device.hide_device && !this.config.disablePlugin) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(`Adding new accessory: ${device.userDefinedDeviceName} ${device.deviceClass} Device ID: ${device.deviceID}`);

      // create a new accessory
      const accessory = new this.api.platformAccessory(device.userDefinedDeviceName, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.device = device;
      accessory.context.deviceID = device.deviceID;
      accessory.context.model = device.deviceClass;
      accessory.context.firmwareRevision = this.version;

      // accessory.context.firmwareRevision = findaccessories.accessoryAttribute.softwareRevision;
      // create the accessory handler for the newly create accessory
      // this is imported from `/Sensors/leakSensors.ts`
      new LeakSensor(this, accessory, locationId, device);
      this.debugLog(`${device.deviceClass} uuid: ${device.deviceID}-${device.deviceClass} (${accessory.UUID})`);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(`Unable to Register new device: ${device.userDefinedDeviceName} ${device.deviceType} ` + ` DeviceID: ${device.deviceID}`);
        this.errorLog('Check Config to see if DeviceID is being Hidden.');
      }
    }
  }

  public unregisterPlatformAccessories(existingAccessory: PlatformAccessory) {
    // remove platform accessories when no longer present
    this.api.unregisterPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [existingAccessory]);
    this.warnLog(`Removing existing accessory from cache: ${existingAccessory.displayName}`);
  }

  public locationinfo(location: settings.location) {
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
