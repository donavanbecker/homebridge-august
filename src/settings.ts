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
  lockId: string;
  lockDetails: lockDetails | Record<string, never>;
};

export type lockDetails = {
  LockName: string;
  UserType: string;
  macAddress: string;
  HouseID: string;
  HouseName: string;
};
