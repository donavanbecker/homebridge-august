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
  apiKey?: string;
  pnSubKey?: string;
  installId: string;
  augustId?: string; // Phone must be formatted +[countrycode][number]
  password?: string;
  countryCode: string;
  validateCode?: string;
  isValidated?: boolean;
};

export type options = {
  refreshRate?: number;
  pushRate?: number;
  logging?: string;
  devices?: Array<devicesConfig>;
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
  parametersToSet: Record<any, undefined>;
  users: Record<any, undefined>;
  pubsubChannel: string;
  ruleHash: any;
  cameras: any[];
  lockId: string;
}

export type BatteryInfo = {
  level: number
  warningState: string
  infoUpdatedDate: string
  lastChangeDate: string
  lastChangeVoltage: number
}

export type HostLockInfo = {
  serialNumber: string
  manufacturer: string
  productID: number
  productTypeID: number
}

export type LockStatus = {
  status: string
  dateTime: string
  isLockStatusChanged: boolean
  valid: boolean
  doorState: string
}

export type Bridge = {
  _id: string
  mfgBridgeID: string
  deviceModel: string
  firmwareVersion: string
  operative: boolean
  status: Status
  locks: Lock[]
  hyperBridge: boolean
}

export type Status = {
  current: string
  lastOffline: string
  updated: string
  lastOnline: string
}

export type Lock = {
  _id: string
  LockID: string
  macAddress: string
}

export interface devicesConfig extends device {
  configLockName?: string;
  lockId: string;
  lock?: lock;
  hide_device?: boolean;
  external?: boolean;
  logging?: string;
  refreshRate?: number;
  firmware?: string;
}

export type lock = {
  hide_lock?: boolean;
  hide_contactsensor?: boolean;
};