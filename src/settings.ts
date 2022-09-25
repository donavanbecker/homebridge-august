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
  augustId?: any;
  password?: any;
};

export type options = {
  refreshRate?: number;
  pushRate?: number;
  logging?: string;
};
