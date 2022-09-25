import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, Service } from 'homebridge';
import { stringify } from 'querystring';
import { LeakSensor } from './devices/leaksensors';
import { RoomSensors } from './devices/roomsensors';
import { RoomSensorThermostat } from './devices/roomsensorthermostats';
import { Thermostats } from './devices/thermostats';
import * as settings from './settings';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ResideoPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public axios: AxiosInstance = axios.create({
    responseType: 'json',
  });

  locations?: any;
  firmware!: settings.accessoryAttribute['softwareRevision'];
  sensorAccessory!: settings.sensorAccessory;
  version = require('../package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires

  public sensorData = [];
  private refreshInterval!: NodeJS.Timeout;
  debugMode!: boolean;
  action!: string;
  platformLogging!: string;

  constructor(public readonly log: Logger, public readonly config: settings.ResideoPlatformConfig, public readonly api: API) {
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
      this.action = 'get Valid Config';
      this.apiError(e);
      return;
    }

    // setup axios interceptor to add headers / api key to each request
    this.axios.interceptors.request.use((request: AxiosRequestConfig) => {
      request.headers!.Authorization = `Bearer ${this.config.credentials?.accessToken}`;
      request.params = request.params || {};
      request.params.apikey = this.config.credentials?.consumerKey;
      request.headers!['Content-Type'] = 'application/json';
      return request;
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      this.debugLog('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      await this.refreshAccessToken();
      try {
        this.locations = await this.discoverlocations();
      } catch (e: any) {
        this.action = 'Discober Locations';
        this.apiError(e);
      }
      try {
        this.discoverDevices();
      } catch (e: any) {
        this.action = 'Discober Device';
        this.apiError(e);
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
    if (!this.config.credentials.consumerKey) {
      throw new Error('Missing consumerKey');
    }
    if (!this.config.credentials.refreshToken) {
      throw new Error('Missing refreshToken');
    }
  }

  async refreshAccessToken() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => this.getAccessToken(), (1800 / 3) * 1000);
    await this.getAccessToken();
  }

  /**
   * Exchange the refresh token for an access token
   */
  async getAccessToken() {
    try {
      let result: any;

      if (this.config.credentials!.consumerSecret) {
        result = (
          await axios({
            url: settings.AuthURL,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
              username: this.config.credentials!.consumerKey,
              password: this.config.credentials!.consumerSecret,
            },
            data: stringify({
              grant_type: 'refresh_token',
              refresh_token: this.config.credentials!.refreshToken,
            }),
            responseType: 'json',
          })
        ).data;
      } else {
        this.warnLog('Please re-link your account in the Homebridge UI.');
      }

      this.config.credentials!.accessToken = result.access_token;
      this.debugLog(`Got access token: ${this.config.credentials!.accessToken}`);
      // check if the refresh token has changed
      if (result.refresh_token !== this.config.credentials!.refreshToken) {
        this.debugLog(`New refresh token: ${result.refresh_token}`);
        await this.updateRefreshToken(result.refresh_token);
      }

      this.config.credentials!.refreshToken = result.refresh_token;
    } catch (e: any) {
      this.action = 'refresh access token';
      this.apiError(e);
    }
  }

  /**
   * The refresh token will periodically change.
   * This method saves the updated refresh token in the config.json file
   * @param newRefreshToken
   */
  async updateRefreshToken(newRefreshToken: string) {
    try {
      // check the new token was provided
      if (!newRefreshToken) {
        throw new Error('New token not provided');
      }

      // load in the current config
      const currentConfig = JSON.parse(readFileSync(this.api.user.configPath(), 'utf8'));

      // check the platforms section is an array before we do array things on it
      if (!Array.isArray(currentConfig.platforms)) {
        throw new Error('Cannot find platforms array in config');
      }

      // find this plugins current config
      const pluginConfig = currentConfig.platforms.find((x: { platform: string }) => x.platform === settings.PLATFORM_NAME);

      if (!pluginConfig) {
        throw new Error(`Cannot find config for ${settings.PLATFORM_NAME} in platforms array`);
      }

      // check the .credentials is an object before doing object things with it
      if (typeof pluginConfig.credentials !== 'object') {
        throw new Error('pluginConfig.credentials is not an object');
      }

      // set the refresh token
      pluginConfig.credentials.refreshToken = newRefreshToken;

      // save the config, ensuring we maintain pretty json
      writeFileSync(this.api.user.configPath(), JSON.stringify(currentConfig, null, 4));
      this.debugLog('Homebridge config.json has been updated with new refresh token.');
    } catch (e: any) {
      this.action = 'refresh token in config';
      this.apiError(e);
    }
  }

  /**
   * this method discovers the Locations
   */
  async discoverlocations() {
    const locations = (await this.axios.get(settings.LocationURL)).data;
    return locations;
  }

  /**
   * this method discovers the rooms at each location
   */
  public async getCurrentSensorData(
    device: settings.device & settings.devicesConfig,
    group: settings.T9groups,
    locationId: settings.location['locationID'],
  ) {
    if (!this.sensorData[device.deviceID] || this.sensorData[device.deviceID].timestamp < Date.now()) {
      const response: any = await this.axios.get(`${settings.DeviceURL}/thermostats/${device.deviceID}/group/${group.id}/rooms`, {
        params: {
          locationId: locationId,
        },
      });
      this.sensorData[device.deviceID] = {
        timestamp: Date.now() + 45000,
        data: this.normalizeSensorDate(response.data),
      };
    } else {
      this.debugLog(`getCurrentSensorData Cache ${device.deviceType} ${device.deviceModel} - ${device.userDefinedDeviceName}`);
    }
    return this.sensorData[device.deviceID].data;
  }

  private normalizeSensorDate(sensorRoomData: { rooms: any }) {
    const normalized = [] as any;
    for (const room of sensorRoomData.rooms) {
      normalized[room.id] = [] as any;
      for (const sensorAccessory of room.accessories) {
        sensorAccessory.roomId = room.id;
        normalized[room.id][sensorAccessory.accessoryId] = sensorAccessory;
      }
    }
    return normalized;
  }

  /**
   * this method discovers the firmware Veriosn for T9 Thermostats
   */
  public async getSoftwareRevision(locationId: settings.location['locationID'], device: settings.device & settings.devicesConfig) {
    if (device.deviceModel.startsWith('T9') && device.groups) {
      for (const group of device.groups) {
        const roomsensors = await this.getCurrentSensorData(device, group, locationId);
        if (device.thermostat?.roompriority?.deviceType) {
          if (roomsensors.length !== 0) {
            this.infoLog(`Total Rooms Found: ${roomsensors.length}`);
          } else {
            this.debugLog(`Total Rooms Found: ${roomsensors.length}`);
          }
        }
        for (const accessories of roomsensors) {
          if (accessories) {
            for (const key in accessories) {
              const sensorAccessory = accessories[key];
              if (
                sensorAccessory.accessoryAttribute &&
                sensorAccessory.accessoryAttribute.type &&
                sensorAccessory.accessoryAttribute.type.startsWith('Thermostat')
              ) {
                this.debugLog(`Software Revision ${group.id} ${sensorAccessory.roomId} ${sensorAccessory.accessoryId} 
                ${sensorAccessory.accessoryAttribute.name} ${JSON.stringify(sensorAccessory.accessoryAttribute.softwareRevision)}`);
                return sensorAccessory.accessoryAttribute.softwareRevision;
              } else {
                this.debugLog(`No Thermostat ${device} ${group} ${locationId}`);
              }
            }
          } else {
            this.debugLog(`No accessories ${device} ${group} ${locationId}`);
          }
        }
      }
    } else {
      this.debugLog(`Not a T9 Thermostat ${device.deviceModel.startsWith('T9')} ${device.groups}`);
    }
  }

  /**
   * This method is used to discover the your location and devices.
   * Accessories are registered by either their DeviceClass, DeviceModel, or DeviceID
   */
  private async discoverDevices() {
    if (this.locations) {
      if (this.locations.length !== 0) {
        this.infoLog(`Total Locations Found: ${this.locations.length}`);
      } else {
        this.debugLog(`Total Locations Found: ${this.locations.length}`);
      }
      // get the devices at each location
      for (const location of this.locations) {
        if (location.devices.length !== 0) {
          this.infoLog(`Total Devices Found at ${location.name}: ${location.devices.length}`);
        } else {
          this.debugLog(`Total Devices Found at ${location.name}: ${location.devices.length}`);
        }
        const locationId = location.locationID;
        this.locationinfo(location);

        const deviceLists = location.devices;
        if (!this.config.options?.devices) {
          this.debugLog(`No Resideo Device Config: ${JSON.stringify(this.config.options?.devices)}`);
          const devices = deviceLists.map((v: any) => v);
          for (const device of devices) {
            this.deviceinfo(device);
            await this.deviceClass(device, location, locationId);
          }
        } else {
          this.debugLog(`Resideo Device Config Set: ${JSON.stringify(this.config.options?.devices)}`);
          const deviceConfigs = this.config.options?.devices;

          const mergeBydeviceID = (a1: { deviceID: string }[], a2: any[]) =>
            a1.map((itm: { deviceID: string }) => ({
              ...a2.find((item: { deviceID: string }) => item.deviceID === itm.deviceID && item),
              ...itm,
            }));

          const devices = mergeBydeviceID(deviceLists, deviceConfigs);
          this.debugLog(`Resideo Devices: ${JSON.stringify(devices)}`);
          for (const device of devices) {
            this.deviceinfo(device);
            await this.deviceClass(device, location, locationId);
          }
        }
      }
    } else {
      this.errorLog('Failed to Discover Locations. Re-Link Your Resideo Account.');
    }
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
        if (device.deviceModel!.startsWith('T9')) {
          try {
            await this.discoverRoomSensors(location.locationID, device);
          } catch (e: any) {
            this.action = 'Find Room Sensor(s)';
            this.apiError(e);
          }
        }
        break;
      default:
        this.infoLog(`Device: ${device.userDefinedDeviceName} with Device Class: ${device.deviceClass} is currently not supported.`);
        this.infoLog('Submit Feature Requests Here: https://git.io/JURLY');
    }
  }

  private async discoverRoomSensors(locationId: settings.location['locationID'], device: settings.device & settings.devicesConfig) {
    // get the devices at each location
    this.roomsensordisplaymethod(device);
    if (device.groups) {
      for (const group of device.groups) {
        const roomsensors = await this.getCurrentSensorData(device, group, locationId);
        for (const accessories of roomsensors) {
          if (accessories) {
            for (const key in accessories) {
              const sensorAccessory = accessories[key];
              if (sensorAccessory.accessoryAttribute) {
                if (sensorAccessory.accessoryAttribute.type) {
                  if (sensorAccessory.accessoryAttribute.type.startsWith('IndoorAirSensor')) {
                    this.debugLog(
                      `Discovered Room Sensor groupId: ${sensorAccessory.roomId},` +
                        ` roomId: ${sensorAccessory.accessoryId}, accessoryId: ${sensorAccessory.accessoryAttribute.name}`,
                    );
                    if (sensorAccessory.accessoryAttribute.model === '0') {
                      sensorAccessory.accessoryAttribute.model = '4352';
                    }
                    sensorAccessory.deviceID = `${sensorAccessory.accessoryId}${sensorAccessory.roomId}${sensorAccessory.accessoryAttribute.model}`;
                    this.createRoomSensors(device, locationId, sensorAccessory, group);
                    this.createRoomSensorThermostat(device, locationId, sensorAccessory, group);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private roomsensordisplaymethod(device: settings.device & settings.devicesConfig) {
    if (device.thermostat?.roompriority) {
      /**
       * Room Priority
       * This will display what room priority option that has been selected.
       */
      if (device.thermostat?.roompriority.deviceType && !device.hide_device && !this.config.disablePlugin) {
        this.warnLog('Displaying Thermostat(s) for Each Room Sensor(s).');
      }
      if (!device.thermostat?.roompriority.deviceType && !device.hide_device && !this.config.disablePlugin) {
        this.warnLog('Only Displaying Room Sensor(s).');
      }
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
        await this.thermostatFirmwareExistingAccessory(device, existingAccessory, location);
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
      await this.thermostatFirmwareNewAccessory(device, accessory, location);
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

  private createRoomSensors(
    device: settings.device & settings.devicesConfig,
    locationId: settings.location['locationID'],
    sensorAccessory: settings.sensorAccessory,
    group: settings.T9groups,
  ) {
    // Room Sensor(s)
    const uuid = this.api.hap.uuid.generate(`${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-RoomSensor`);
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      if (!device.hide_device && !device.thermostat?.roomsensor?.hide_roomsensor && !this.config.disablePlugin) {
        this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName} DeviceID: ${sensorAccessory.deviceID}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.displayName = sensorAccessory.accessoryAttribute.name;
        existingAccessory.context.deviceID = sensorAccessory.deviceID;
        existingAccessory.context.model = sensorAccessory.accessoryAttribute.model;
        existingAccessory.context.firmwareRevision = sensorAccessory.accessoryAttribute.softwareRevision || this.version;
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new RoomSensors(this, existingAccessory, locationId, device, sensorAccessory, group);
        this.debugLog(
          `${sensorAccessory.accessoryAttribute.type}` +
            ` uuid: ${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-RoomSensor, (${existingAccessory.UUID})`,
        );
      } else {
        this.unregisterPlatformAccessories(existingAccessory);
      }
    } else if (!device.hide_device && !device.thermostat?.roomsensor?.hide_roomsensor && !this.config.disablePlugin) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(
        `Adding new accessory: ${sensorAccessory.accessoryAttribute.name} ${sensorAccessory.accessoryAttribute.type} ` +
          `Device ID: ${sensorAccessory.deviceID}`,
      );

      // create a new accessory
      const accessory = new this.api.platformAccessory(sensorAccessory.accessoryAttribute.name, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.deviceID = sensorAccessory.deviceID;
      accessory.context.model = sensorAccessory.accessoryAttribute.model;
      accessory.context.firmwareRevision = sensorAccessory.accessoryAttribute.softwareRevision || this.version;

      // create the accessory handler for the newly create accessory
      // this is imported from `roomSensor.ts`
      new RoomSensors(this, accessory, locationId, device, sensorAccessory, group);
      this.debugLog(
        `${sensorAccessory.accessoryAttribute.type}` +
          ` uuid: ${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-RoomSensor, (${accessory.UUID})`,
      );
      // link the accessory to your platform
      this.api.registerPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(
          `Unable to Register new device: ${sensorAccessory.accessoryAttribute.name} ${sensorAccessory.accessoryAttribute.type} ` +
            `DeviceID: ${sensorAccessory.deviceID}`,
        );
        this.errorLog('Check Config to see if DeviceID is being Hidden.');
      }
    }
  }

  private createRoomSensorThermostat(
    device: settings.device & settings.devicesConfig,
    locationId: settings.location['locationID'],
    sensorAccessory: settings.sensorAccessory,
    group: settings.T9groups,
  ) {
    const uuid = this.api.hap.uuid.generate(`${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-RoomSensorThermostat`);

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find((accessory: { UUID }) => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      if (device.thermostat?.roompriority?.deviceType && !device.hide_device && !this.config.disablePlugin) {
        this.infoLog(`Restoring existing accessory from cache: ${existingAccessory.displayName} DeviceID: ${sensorAccessory.deviceID}`);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.displayName = sensorAccessory.accessoryAttribute.name;
        existingAccessory.context.deviceID = sensorAccessory.deviceID;
        existingAccessory.context.model = sensorAccessory.accessoryAttribute.model;
        existingAccessory.context.firmwareRevision = sensorAccessory.accessoryAttribute.softwareRevision || this.version;
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new RoomSensorThermostat(this, existingAccessory, locationId, device, sensorAccessory, group);
        this.debugLog(
          `${sensorAccessory.accessoryAttribute.type} Thermostat uuid:` +
            ` ${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-RoomSensorThermostat, (${existingAccessory.UUID})`,
        );
      } else {
        this.unregisterPlatformAccessories(existingAccessory);
      }
    } else if (device.thermostat?.roompriority?.deviceType && !device.hide_device && !this.config.disablePlugin) {
      // the accessory does not yet exist, so we need to create it
      this.infoLog(
        `Adding new accessory: ${sensorAccessory.accessoryAttribute.name} ${sensorAccessory.accessoryAttribute.type} ` +
          `Device ID: ${sensorAccessory.deviceID}`,
      );

      // create a new accessory
      const accessory = new this.api.platformAccessory(sensorAccessory.accessoryAttribute.name, uuid);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.deviceID = sensorAccessory.deviceID;
      accessory.context.model = sensorAccessory.accessoryAttribute.model;
      accessory.context.firmwareRevision = sensorAccessory.accessoryAttribute.softwareRevision || this.version;

      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      new RoomSensorThermostat(this, accessory, locationId, device, sensorAccessory, group);
      this.debugLog(
        `${sensorAccessory.accessoryAttribute.type} Thermostat uuid:` +
          ` ${sensorAccessory.accessoryAttribute.name}-${sensorAccessory.accessoryAttribute.type}-${sensorAccessory.accessoryId}-` +
          `RoomSensorThermostat, (${accessory.UUID})`,
      );

      // link the accessory to your platform
      this.api.registerPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } else {
      if (this.platformLogging?.includes('debug')) {
        this.errorLog(
          `Unable to Register new device: ${sensorAccessory.accessoryAttribute.name} ${sensorAccessory.accessoryAttribute.type} ` +
            `DeviceID: ${sensorAccessory.deviceID}`,
        );
        this.errorLog('Check Config to see if DeviceID is being Hidden.');
      }
    }
  }

  public async thermostatFirmwareNewAccessory(device: settings.device & settings.devicesConfig, accessory: PlatformAccessory, location: any) {
    if (device.deviceModel.startsWith('T9')) {
      try {
        accessory.context.firmwareRevision = await this.getSoftwareRevision(location.locationID, device);
      } catch (e: any) {
        this.action = 'Get T9 Firmware Version';
        this.apiError(e);
      }
    } else if (device.deviceModel.startsWith('Round') || device.deviceModel.startsWith('Unknown') || device.deviceModel.startsWith('D6')) {
      accessory.context.firmwareRevision = device.thermostatVersion;
    } else {
      accessory.context.firmwareRevision = this.version;
    }
  }

  public async thermostatFirmwareExistingAccessory(
    device: settings.device & settings.devicesConfig,
    existingAccessory: PlatformAccessory,
    location: any,
  ) {
    if (device.deviceModel.startsWith('T9')) {
      try {
        existingAccessory.context.firmwareRevision = await this.getSoftwareRevision(location.locationID, device);
      } catch (e: any) {
        this.action = 'Get T9 Firmware Version';
        this.apiError(e);
      }
    } else if (device.deviceModel.startsWith('Round') || device.deviceModel.startsWith('Unknown') || device.deviceModel.startsWith('D6')) {
      existingAccessory.context.firmwareRevision = device.thermostatVersion;
    } else {
      existingAccessory.context.firmwareRevision = this.version;
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

  public deviceinfo(device: {
    deviceID: string;
    deviceType: string;
    deviceClass: string;
    deviceModel: string;
    priorityType: string;
    settings: settings.Settings;
    inBuiltSensorState: settings.inBuiltSensorState;
    groups: settings.device['groups'] & settings.devicesConfig;
  }) {
    if (this.platformLogging?.includes('debug')) {
      this.warnLog(JSON.stringify(device));
      if (device.deviceID) {
        this.warnLog(JSON.stringify(device.deviceID));
        this.errorLog(`Device ID: ${device.deviceID}`);
      }
      if (device.deviceType) {
        this.warnLog(JSON.stringify(device.deviceType));
        this.errorLog(`Device Type: ${device.deviceType}`);
      }
      if (device.deviceClass) {
        this.warnLog(JSON.stringify(device.deviceClass));
        this.errorLog(`Device Class: ${device.deviceClass}`);
      }
      if (device.deviceModel) {
        this.warnLog(JSON.stringify(device.deviceModel));
        this.errorLog(`Device Model: ${device.deviceModel}`);
      }
      if (device.priorityType) {
        this.warnLog(JSON.stringify(device.priorityType));
        this.errorLog(`Device Priority Type: ${device.priorityType}`);
      }
      if (device.settings) {
        this.warnLog(JSON.stringify(device.settings));
        if (device.settings.fan) {
          this.warnLog(JSON.stringify(device.settings.fan));
          this.errorLog(`Device Fan Settings: ${JSON.stringify(device.settings.fan)}`);
          if (device.settings.fan.allowedModes) {
            this.warnLog(JSON.stringify(device.settings.fan.allowedModes));
            this.errorLog(`Device Fan Allowed Modes: ${device.settings.fan.allowedModes}`);
          }
          if (device.settings.fan.changeableValues) {
            this.warnLog(JSON.stringify(device.settings.fan.changeableValues));
            this.errorLog(`Device Fan Changeable Values: ${JSON.stringify(device.settings.fan.changeableValues)}`);
          }
        }
      }
      if (device.inBuiltSensorState) {
        this.warnLog(JSON.stringify(device.inBuiltSensorState));
        if (device.inBuiltSensorState.roomId) {
          this.warnLog(JSON.stringify(device.inBuiltSensorState.roomId));
          this.errorLog(`Device Built In Sensor Room ID: ${device.inBuiltSensorState.roomId}`);
        }
        if (device.inBuiltSensorState.roomName) {
          this.warnLog(JSON.stringify(device.inBuiltSensorState.roomName));
          this.errorLog(`Device Built In Sensor Room Name: ${device.inBuiltSensorState.roomName}`);
        }
      }
      if (device.groups) {
        this.warnLog(JSON.stringify(device.groups));

        for (const group of device.groups) {
          this.errorLog(`Group: ${group.id}`);
        }
      }
    }
  }

  apiError(e: any) {
    if (e.message.includes('400')) {
      this.errorLog(`Failed to ${this.action}: Bad Request`);
      this.debugLog('The client has issued an invalid request. This is commonly used to specify validation errors in a request payload.');
    } else if (e.message.includes('401')) {
      this.errorLog(`Failed to ${this.action}: Unauthorized Request`);
      this.debugLog('Authorization for the API is required, but the request has not been authenticated.');
    } else if (e.message.includes('403')) {
      this.errorLog(`Failed to ${this.action}: Forbidden Request`);
      this.debugLog('The request has been authenticated but does not have appropriate permissions, or a requested resource is not found.');
    } else if (e.message.includes('404')) {
      this.errorLog(`Failed to ${this.action}: Requst Not Found`);
      this.debugLog('Specifies the requested path does not exist.');
    } else if (e.message.includes('406')) {
      this.errorLog(`Failed to ${this.action}: Request Not Acceptable`);
      this.debugLog('The client has requested a MIME type via the Accept header for a value not supported by the server.');
    } else if (e.message.includes('415')) {
      this.errorLog(`Failed to ${this.action}: Unsupported Requst Header`);
      this.debugLog('The client has defined a contentType header that is not supported by the server.');
    } else if (e.message.includes('422')) {
      this.errorLog(`Failed to ${this.action}: Unprocessable Entity`);
      this.debugLog(
        'The client has made a valid request, but the server cannot process it.' +
          ' This is often used for APIs for which certain limits have been exceeded.',
      );
    } else if (e.message.includes('429')) {
      this.errorLog(`Failed to ${this.action}: Too Many Requests`);
      this.debugLog('The client has exceeded the number of requests allowed for a given time window.');
    } else if (e.message.includes('500')) {
      this.errorLog(`Failed to ${this.action}: Internal Server Error`);
      this.debugLog('An unexpected error on the SmartThings servers has occurred. These errors should be rare.');
    } else {
      this.errorLog(`Failed to ${this.action}`);
    }
    if (this.platformLogging?.includes('debug')) {
      this.errorLog(`Failed to ${this.action}, Error Message: ${JSON.stringify(e.message)}`);
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
