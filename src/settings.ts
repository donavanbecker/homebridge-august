import { PlatformConfig } from 'homebridge';
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'August';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-august';

//Config
export interface AugustPlatformConfig extends PlatformConfig {
  credentials?: credentials;
  disablePlugin?: boolean;
  options?: options | Record<string, never>;
}

export type credentials = {
  augustId?: string; // Phone must be formatted +[countrycode][number]
  password?: string;
  validateCode?: string;
};

export type options = {
  refreshRate?: number;
  pushRate?: number;
  logging?: string;
};

export type device = {
  LockName: string;
  Type: number;
  Created: string;
  Updated: string;
  LockId: string;
  HouseID: string;
  HouseName: string;
  Calibrated: boolean;
  timeZone: string;
  battery: number;
  batteryInfo: BatteryInfo;
  doorStateOpenTimeout: number;
  hostLockInfo: HostLockInfo;
  supportsEntryCodes: boolean;
  remoteOperateSecret: string;
  skuNumber: string;
  macAddress: string;
  SerialNumber: string;
  LockStatus: LockStatus;
  currentFirmwareVersion: string;
  homeKitEnabled: boolean
  zWaveEnabled: boolean;
  isGalileo: boolean;
  Bridge: Bridge;
  OfflineKeys: OfflineKeys;
  parametersToSet: Record<any, undefined>;
  users: Record<any, undefined>;
  pubsubChannel: string;
  ruleHash: any;
  cameras: any[];
  geofenceLimits: GeofenceLimits;
  pins: Pins;
  lockId: string;
}

export interface BatteryInfo {
  level: number
  warningState: string
  infoUpdatedDate: string
  lastChangeDate: string
  lastChangeVoltage: number
}

export interface HostLockInfo {
  serialNumber: string
  manufacturer: string
  productID: number
  productTypeID: number
}

export interface LockStatus {
  status: string
  dateTime: string
  isLockStatusChanged: boolean
  valid: boolean
  doorState: string
}

export interface Bridge {
  _id: string
  mfgBridgeID: string
  deviceModel: string
  firmwareVersion: string
  operative: boolean
  status: Status
  locks: Lock[]
  hyperBridge: boolean
}

export interface Status {
  current: string
  lastOffline: string
  updated: string
  lastOnline: string
}

export interface Lock {
  _id: string
  LockID: string
  macAddress: string
}

export interface OfflineKeys {
  created: any[]
  loaded: Loaded[]
  deleted: any[]
  loadedhk: Loadedhk[]
}

export interface Loaded {
  created: string
  key: string
  slot: number
  UserID: string
  loaded: string
}

export interface Loadedhk {
  key: string
  slot: number
  UserID: string
  created: string
  loaded: string
}

export interface GeofenceLimits {
  ios: Ios
}

export interface Ios {
  debounceInterval: number
  gpsAccuracyMultiplier: number
  maximumGeofence: number
  minimumGeofence: number
  minGPSAccuracyRequired: number
}

export interface Pins {
  created: any[]
  loaded: Loaded2[]
  disabled: any[]
  disabling: any[]
  enabling: any[]
  deleting: any[]
  updating: any[]
}

export interface Loaded2 {
  _id: string
  type: string
  lockID: string
  userID: string
  state: string
  pin: string
  slot: number
  accessType: string
  callingUserID: string
  apiKey: string
  createdAt: string
  updatedAt: string
  loadedDate: string
  firstName: string
  lastName: string
  unverified: boolean
}


