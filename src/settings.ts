import { PlatformConfig } from 'homebridge';
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'Resideo';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-resideo';

/**
 * This is the main url used to access Resideo API
 */
export const AuthURL = 'https://api.honeywell.com/oauth2/token';

/**
 * This is the main url used to access Resideo API
 */
export const LocationURL = 'https://api.honeywell.com/v2/locations';

/**
 * This is the main url used to access Resideo API
 */
export const DeviceURL = 'https://api.honeywell.com/v2/devices';

/**
 * This is the url used to access UI Login to Resideo API
 */
export const UIurl = 'https://homebridge-honeywell.iot.oz.nu/user/refresh';

//Config
export interface ResideoPlatformConfig extends PlatformConfig {
  credentials?: credentials;
  disablePlugin?: boolean;
  options?: options | Record<string, never>;
}

export type credentials = {
  accessToken?: any;
  consumerKey?: any;
  consumerSecret?: any;
  refreshToken?: any;
};

export type options = {
  refreshRate?: number;
  pushRate?: number;
  devices?: Array<devicesConfig>;
  logging?: string;
};

export interface devicesConfig extends device {
  deviceClass: string;
  deviceID: string;
  thermostat?: thermostat;
  leaksensor?: leaksensor;
  hide_device?: boolean;
  logging?: string;
  refreshRate?: number;
  retry?: boolean;
}

export type thermostat = {
  hide_fan?: boolean;
  hide_humidity?: boolean;
  thermostatSetpointStatus?: string;
  roomsensor?: roomsensor;
  roompriority?: roompriority;
};

export type leaksensor = {
  hide_humidity?: boolean;
  hide_temperature?: boolean;
  hide_leak?: boolean;
};

export type roomsensor = {
  hide_roomsensor?: boolean;
  hide_temperature?: boolean;
  hide_occupancy?: boolean;
  hide_motion?: boolean;
  hide_humidity?: boolean;
  logging?: string;
  refreshRate?: number;
};

export type roompriority = {
  deviceType?: string;
  priorityType?: string;
  logging?: string;
  refreshRate?: number;
};

export type modes = {
  Off: number;
  Heat: number;
  Cool: number;
  Auto: number;
};

export type payload = {
  mode?: string;
  heatSetpoint: number;
  coolSetpoint: number;
  thermostatSetpointStatus?: string;
  nextPeriodTime?: string;
  autoChangeoverActive?: boolean;
  thermostatSetpoint?: number;
  unit?: string;
};

// Location
export type location = {
  locationID: number;
  name: string;
  devices: Array<device>;
};

export type device = {
  groups?: Array<T9groups>;
  inBuiltSensorState?: inBuiltSensorState;
  settings?: Settings;
  deviceClass: string;
  deviceType: string;
  deviceID: string;
  userDefinedDeviceName: string;
  name?: string;
  isAlive: boolean;
  priorityType?: string;
  units?: string;
  indoorTemperature?: number;
  allowedModes?: string[];
  minHeatSetpoint?: number;
  maxHeatSetpoint?: number;
  minCoolSetpoint?: number;
  maxCoolSetpoint?: number;
  changeableValues?: ChangeableValues;
  operationStatus?: OperationStatus;
  indoorHumidity?: number;
  deviceModel: string;
  displayedOutdoorHumidity?: number;
  scheduleStatus?: string;
  allowedTimeIncrements?: number;
  isUpgrading?: boolean;
  isProvisioned?: boolean;
  macID?: string;
  dataSyncStatus?: string;
  outdoorTemperature?: number;
  deadband?: number;
  hasDualSetpointStatus?: boolean;
  thermostatVersion?: string;
  parentDeviceId?: number;
  service: Service;
  deviceSettings: Record<string, unknown>; //DeviceSettings
  firmwareVersion?: string;
  vacationHold?: VacationHold;
  currentSchedulePeriod?: CurrentSchedulePeriod;
  scheduleCapabilities?: ScheduleCapabilities;
  scheduleType?: ScheduleType;
  changeSource?: ChangeSource;
  partnerInfo?: PartnerInfo;
  deviceRegistrationDate?: Date;
  indoorHumidityStatus?: string;
  waterPresent: boolean;
  currentSensorReadings: CurrentSensorReadings;
  batteryRemaining: number;
  isRegistered: boolean;
  hasDeviceCheckedIn: boolean;
  isDeviceOffline: boolean;
};

export type T9groups = {
  id: number;
};

export type inBuiltSensorState = {
  roomId: number;
  roomName: string;
};

// Fan Settings
export type Settings = {
  homeSetPoints?: HomeSetPoints;
  awaySetPoints?: AwaySetPoints;
  fan: Fan;
  temperatureMode?: TemperatureMode;
  specialMode?: SpecialMode;
  hardwareSettings?: HardwareSettings;
  devicePairingEnabled?: boolean;
};

export type ChangeableValues = {
  mode: string;
  autoChangeoverActive?: boolean;
  heatSetpoint: number;
  coolSetpoint: number;
  thermostatSetpointStatus?: string;
  nextPeriodTime?: string;
  endHeatSetpoint?: number;
  endCoolSetpoint?: number;
  heatCoolMode: string;
  emergencyHeatActive?: boolean;
};

export type OperationStatus = {
  mode: string;
  fanRequest?: boolean;
  circulationFanRequest?: boolean;
};

export type Service = {
  mode: string;
};

export type AwaySetPoints = {
  awayHeatSP: number;
  awayCoolSP: number;
  smartCoolSP: number;
  smartHeatSP: number;
  useAutoSmart: boolean;
  units: string;
};

export type HomeSetPoints = {
  homeHeatSP: number;
  homeCoolSP: number;
  units: string;
};

export type TemperatureMode = {
  feelsLike?: boolean;
  air: boolean;
};

export type SpecialMode = {
  autoChangeoverActive: boolean;
  emergencyHeatActive?: boolean;
};

export type Fan = {
  allowedModes: string[];
  changeableValues: FanChangeableValues;
  fanRunning: boolean;
  allowedSpeeds?: AllowedSpeed[];
};

export type FanChangeableValues = {
  mode: string;
};

export type AllowedSpeed = {
  item: string;
  value: Value;
};

export type Value = {
  speed?: number;
  mode: string;
};

export type VacationHold = {
  enabled: boolean;
};

export type CurrentSchedulePeriod = {
  day: string;
  period: string;
};

export type ScheduleCapabilities = {
  availableScheduleTypes: string[];
  schedulableFan: boolean;
};

export type ScheduleType = {
  scheduleType: string;
  scheduleSubType: string;
};

export type ChangeSource = {
  by: string;
  name: string;
};

export type HardwareSettings = {
  brightness: number;
  maxBrightness: number;
};

export type PartnerInfo = {
  singleOrMultiODUConfiguration: number;
  parentDeviceModelId: number;
  parentDeviceBrandId: number;
  oduName: string;
};

export type DeviceSettings = {
  temp: Temp;
  humidity: Humidity;
  userDefinedName: string;
  buzzerMuted: boolean;
  checkinPeriod: number;
  currentSensorReadPeriod: number;
};

export type Humidity = {
  high: Record<string, unknown>;
  low: Record<string, unknown>;
};

export type CurrentSensorReadings = {
  temperature: number;
  humidity: number;
};

export type Temp = {
  high: Record<string, unknown>;
  low: Record<string, unknown>;
};

// T9 Room Sensors
export type sensorAccessory = {
  accessoryId: number;
  accessoryAttribute: accessoryAttribute;
  accessoryValue: accessoryValue;
  roomId: number;
  deviceID: string;
};

export type accessoryAttribute = {
  type: string;
  connectionMethod: string;
  name: string;
  model: string;
  serialNumber: string;
  softwareRevision: string;
  hardwareRevision: string;
};

export type accessoryValue = {
  coolSetpoint: number;
  heatSetpoint: number;
  indoorHumidity: number;
  indoorTemperature: number;
  motionDet: boolean;
  occupancyDet: boolean;
  excludeTemp: boolean;
  excludeMotion: boolean;
  pressure: number;
  occupancyTimeout: number;
  status: string;
  batteryStatus: string;
  rssiAverage: number;
  occupancySensitivity: string;
};

// T9 Room Priority
export type Priority = {
  deviceId: string;
  status: string;
  currentPriority: CurrentPriority;
};

export type CurrentPriority = {
  priorityType: string;
  selectedRooms: Record<string, unknown>;
  rooms: PriorityRooms[];
};

export type PriorityRooms = {
  rooms: PriorityRoom;
};

export type PriorityRoom = {
  id: number;
  roomName: string;
  roomAvgTemp: number;
  roomAvgHumidity: number;
  overallMotion: boolean;
  accessories: Accessory[];
};

export type Accessory = {
  id: number;
  type: string;
  excludeTemp: boolean;
  excludeMotion: boolean;
  temperature: number;
  status: string;
  detectMotion: boolean;
};

export interface AxiosRequestConfig {
  params?: Record<string, unknown>;
  headers?: any;
}
