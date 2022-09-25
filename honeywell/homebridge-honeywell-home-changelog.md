# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/)

## [Version 11.4.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.4.4) (2022-09-04)

## What's Changes
- Fix for Config Settings not opening, Fixes [#737](https://github.com/donavanbecker/homebridge-honeywell-home/issues/737).
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.4.3...v11.4.4

## [Version 11.4.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.4.3) (2022-08-30)

## What's Changes
- Fix for redirect URL issue, Fixes [#379](https://github.com/donavanbecker/homebridge-honeywell-home/issues/739#issuecomment-1231567271).
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.4.2...v11.4.3

## [Version 11.4.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.4.2) (2022-06-25)

## What's Changes
- Fix issue where logging was causing invalid Config.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.4.1...v11.4.2

## [Version 11.4.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.4.1) (2022-05-04)

## What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.4.0...v11.4.1

## [Version 11.4.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.4.0) (2022-03-19)

## What's Changes

- Added option to retry after receiving Honeywell API Error.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.8...v11.4.0

## [Version 11.3.8](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.8) (2022-02-15)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.7...v11.3.8

## [Version 11.3.7](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.7) (2022-02-12)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.6...v11.3.7

## [Version 11.3.6](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.6) (2022-02-01)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.5...v11.3.6

## [Version 11.3.5](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.5) (2022-01-29)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.4...v11.3.5

## [Version 11.3.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.4) (2022-01-22)

## What's Changes

- Fixed: Issue where device logging and refreshRate wouldn't display.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.3...v11.3.4

## [Version 11.3.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.3) (2022-01-15)

## What's Changes

- Fixed: Only log config if it is set.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.2...v11.3.3

## [Version 11.3.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.2) (2022-01-14)

## What's Changes

- Fix: Device Logging and refreshRate not apply to Devices.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.1...v11.3.2

## [Version 11.3.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.1) (2022-01-14)

## What's Changes

- Housekeeping on Logging and refreshRate.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.3.0...v11.3.1

## [Version 11.3.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.0) (2022-01-14)

## What's Changes

### Major Change To `Logging`:

- Added the following Logging Options:
  - `Standard`
  - `None`
  - `Debug`
- Removed Device Logging Option, which was pushed into new logging under debug.
- Added Device Logging Override for each Device, by using the Device Config.

### Major Changes to `refreshRate`:

- Added an option to override `refreshRate` for each Device, by using the Device Config.

### Other Changes

- Enhancments: Made Honeywell Device Settings more managable by using Tabs.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.2.1...v11.3.0

## [Version 11.2.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.3.0) (2022-01-06)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.2.0...v11.2.1

## [Version 11.2.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.2.0) (2021-12-18)

## What's Changes

- Fixed Bug: Changing the temperature doesn't work. [#613](https://github.com/donavanbecker/homebridge-honeywell-home/issues/613)
- Moved the `Room Sensor` and `Room Priority` settings under `Thermostat` DeviceClass, since they are all tied to the Thermostat.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.1.2...v11.2.0

## [Version 11.1.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.1.2) (2021-12-15)

## What's Changes

- Fixed: `config.schema.json` room priority parameter.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.1.1...v11.1.2

## [Version 11.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.1.1) (2021-12-15)

## What's Changes

- Fixed Bug: Changing the temperature doesn't work. [#598](https://github.com/donavanbecker/homebridge-honeywell-home/issues/598)
- Fixed Bug: Changelog has incorrect link for full changelog. [#605](https://github.com/donavanbecker/homebridge-honeywell-home/issues/605)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.1.0...v11.1.1

## [Version 11.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.1.0) (2021-11-19)

## What's Changes

- Add Device Configs, So that each device can be customized for itself.
  - ANY CONFIGS SET MUST BE REMOVED AND REPLACED WITH THIS NEW DEVICE CONFIGS

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.0.4...v11.1.0

## [Version 11.0.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.0.4) (2021-11-13)

## What's Changes

- Allow `refreshRate` to be set to 30 Seconds or Higher.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.0.3...v11.0.4

## [Version 11.0.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/11.0.3) (2021-11-12)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.0.2...v11.0.3

## [Version 11.0.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.0.2) (2021-10-28)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.0.1...v11.0.2

## [Version 11.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.0.1) (2021-10-21)

## What's Changes

- Fix for [#580](https://github.com/donavanbecker/homebridge-honeywell-home/issues/580)'s `failed to update status` error.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v11.0.0...v11.0.1

## [Version 11.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v11.0.0) (2021-10-20)

## What's Changes

- Changed the way that devices are named and stored in cache
  - _You will have to Clear Cache on your devices and re-add them because of this._
- Replace Device Discovery with Plugin Device Logging Config Setting to show more logs.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v10.1.1...v11.0.0

## [Version 10.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v10.1.1) (2021-10-02)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v10.1.0...v10.1.1

## [Version 10.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v10.1.0) (2021-09-19)

## What's Changes

- Implment Plugin Debug Logging.
- Fix for Round Thermostats Auto mode, thanks to [@mowens](https://github.com/mowens) for PR [#558](https://github.com/donavanbecker/homebridge-honeywell-home/pull/558)

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v10.0.1...v10.1.0

## [Version 10.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v10.0.1) (2021-09-05)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v10.0.0...v10.0.1

## [Version 10.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v10.0.0) (2021-08-21)

## What's Changes

- Implimented A Local Authentication HTTP Server that runs when opening Plugin Settings.
  - URL(Callback URL \*) that will be used to Link or Relink your Honeywell Account, will now be your local IP.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.6.0...v10.0.0

## [Version 9.6.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.6.0) (2021-07-31)

## What's Changes

- Add a Copy to Clipboard Button, for Honeywell Linking URL.
- Add a Back To Intro Arrow, To get back to intro if no config has been saved.
- Add a link and unlink notification.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.5.2...v9.6.0

## [Version 9.5.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.5.2) (2021-07-28)

## What's Changes

- Custom UI updates.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.5.1...v9.5.2

## [Version 9.5.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.5.1) (2021-07-27)

## What's Changes

- Fix Custom UI not loading.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.5.0...v9.5.1

## [Version 9.5.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.5.0) (2021-07-27)

## What's Changes

- Implement Custom UI for Linking, Re-Linking, and Un-Linking.
- Added Option to Disable Plugin in the Config.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.4.4...v9.5.0

## [Version 9.4.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.4.4) (2021-07-22)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.4.2...v9.4.4

## [Version 9.4.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.4.3) (2021-06-15)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.2.2...v9.4.3

## [Version 9.4.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.4.2) (2021-05-25)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.4.1...v9.4.2

## [Version 9.4.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.4.1) (2021-03-08)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.4.0...v9.4.1

## [Version 9.4.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.4.0) (2021-03-02)

## What's Changes

- Better handling of Homebridge 1.3.0 functions.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.3.3...v9.4.0

## [Version 9.3.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.3.3) (2021-03-01)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.3.2...v9.3.3

## [Version 9.3.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.3.2) (2021-02-25)

## What's Changes

- Fix issue with not config potentially not working in some cases.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.3.1...v9.3.2

## [Version 9.3.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.3.1) (2021-02-25)

## What's Changes

- Correct issue with `config.schema.json`.
- Fix issue with not hiding sensors when not compatible with device or hidden with config.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.3.0...v9.3.1

## [Version 9.3.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.3.0) (2021-02-23)

## What's Changes

- Added Characteristic updating to FirmwareRevision.
- Updated BatteryService Characteristic to Battery to meeting Homebridge 1.3.0 Standards.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.2.0...v9.3.0

## [Version 9.2.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.2.0) (2021-02-22)

## What's Changes

- Add support and set new requirement for Homebridge v1.3.0.
- Fixed Issue where thermostat was sending update when just clicking into Thermostat, plugin now waits for changes.
- Characteristics are now only updated if defined with a valid `CharacteristicValue`.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.1.0...v9.2.0

## [Version 9.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.1.0) (2021-02-16)

## What's Changes

- Moved Humidity Sensor to is own Service so that it displays as it on devices.
  - Added option to config to disable humidity sensor.
- Fixed Leaksensor Display issue with rouding tempature and humidity.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v9.0.0...v9.1.0

## [Version 9.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v9.0.0) (2021-02-16)

## What's Changes

- Combined all Thermostat Models into 1 Thermostat file, making for easier updating of features and configurations.
- Created DeviceIDs for Roomsensors and Roomsensor Thermostats so that they can be removed.
- Added `PushRate`, which allows you to control how long the plugins waits before pushing an update to the Honeywell API.
  - this can lower the nubmer of pushes being sent.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.4.0...v9.0.0

## [Version 8.4.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.4.0) (2021-02-08)

## What's Changes

- Fixed an issue where API Updates were pushed, with no changes.
- Fixed Issue with `config.schema.json` displaying issue.
- Added API Errror Handling to update Characteristics in HomeKit.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.3.2...v8.4.0

## [Version 8.3.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.3.2) (2021-01-14)

## What's Changes

- Update Dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.3.1...v8.3.2

## [Version 8.3.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.3.1) (2021-01-08)

## What's Changes

- Fixed warning logs for Homebridge Beta `v1.3.0`.
- More Code Clean up.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.3.0...v8.3.1

## [Version 8.3.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.3.0) (2021-01-04)

## What's Changes

- Allow for Hiding Devices based off of `DeviceID` instead of `DeviceType`.
- Fix issue with Leak Sensors not updating new sensor data.
- Changing `ttl` code to `refreshRate`, Configs will need to be update to not use default Refresh Rate.
- Code Clean up.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.2.0...v8.3.0

## [Version 8.2.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/8.2.0) (2020-12-25)

## What's Changes

- Refractored Plugin to reported respond to API better. Thanks [NorthernMan54](https://github.com/NorthernMan54).
- For T9 Users, Room Sensors display their own info, instead of display only 1 Room Sensors info. Thanks [NorthernMan54](https://github.com/NorthernMan54).
- For T9 Users, Motion Sensor has been removed. Since data cannot be pulled quick enough, and has been inaccurate from API.
- Updated other dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.1.1...v8.2.0

## [Version 8.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.1.1) (2020-11-18)

## What's Changes

- Updated other dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.1.0...v8.1.1

## [Version 8.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.1.0) (2020-10-24)

## What's Changes

- Fix for `Cannot set property 'ttl' of undefined`.
- Updated other dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.0.1...v8.1.0

## [Version 8.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.0.1) (2020-09-28)

## What's Changes

- Move Homebridge dependency up to latest homebridge.
- Updated other dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v8.0.0...v8.0.1

## [Version 8.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v8.0.0) (2020-09-16)

## What's Changes

### Major Changes

- Completely reworked the way that Thermostat and Leak Sensors are discovered.
  - Added Room Priority. This is for T9 & T10 Thermostats Only.
    - This allows you to Display a Thermostat in the Room where your Room Sensors are and then set priority to that room.
- Completely reworked the way that Room Sensors discovered.

## Other Changes

- You can now set the Thermostat Setpoint Status to: NoHold, PermanentHold, or TemporaryHold.
- You can now set the Room Priority Type to: PickARoom, WholeHouse, or FollowMe.
- Fix for CurrentHeatingCoolingState not showing the correct state.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v7.0.1...v8.0.0

## [Version 7.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v7.0.1) (2020-08-29)

## What's Changes

- Small little cosmetic changes.
- Update UI Server Portal dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v7.0.0...v7.0.1

## [Version 7.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v7.0.0) (2020-08-29)

## What's Changes

### Major Changes

- Added Support for Leak Sensors, Thermostats, and Room Sensors all into one plugin.
- Seperated each Accessory into its on plugin.
  - [homebridge-honeywell-home-thermostat](https://github.com/donavanbecker/homebridge-honeywell-home-thermostat)
  - [homebridge-honeywell-home-roomsensors](https://github.com/donavanbecker/homebridge-honeywell-home-roomsensors)
  - [homebridge-honeywell-leak](https://github.com/donavanbecker/homebridge-honeywell-leak)

## Other Changes

- Added support to Hide Thermstats.
- Added support to Hide Thermstats Fans.
- Added support to Hide Leak Sensors.
- Added support to Hide Room Sensors.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v6.2.0...v7.0.0

## [Version 6.2.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v6.2.0) (2020-08-24)

## What's Changes

- Added support for plugin to recognize if fan is present or not.
- Added support to know between LCC and TCC devices.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v6.1.2...v6.2.0

## [Version 6.1.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v6.1.2) (2020-08-11)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v6.1.2...v6.2.0

## [Version 6.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v6.1.1) (2020-08-10)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v6.1.0...v6.1.1

## [Version 6.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v6.1.0) (2020-07-30)

## What's Changes

- If refresh token expires, the new refresh token that is fetched will now be saved to `config.json`.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v6.0.0...v6.1.0

## [Version 6.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v6.0.0) (2020-07-28)

## What's Changes

### Major Changes

- Converted project to Typscript.
- Changed the way that devices are found.

### Other Changes

- Created a plugin that can add T9 Thermostat: [homebridge-honeywell-home-roomsensors](https://github.com/donavanbecker/homebridge-honeywell-home-roomsensors).
- Find firmware of device at startup and add to accessory context.
- removed provisioning criteria for Honeywell Round Thermostats to be added to plugin.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.1.1...v6.0.0

## [Version 5.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.1.1) (2020-07-15)

## What's Changes

- Added more logging for offline devices

  - now displays deviceID.
  - now displays if device is Alive, Provisioned, and Class `Thermostat`.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.1.0...v5.1.1

## [Version 5.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.1.0) (2020-07-14)

## What's Changes

- Added Support for Fan Control: `Auto`, `Circulate`, and `On`.
  - If Target Fan Mode is `MANUAL` and Active is `ACTIVE` in Homekit, then the fan will be set to Honywell Mode `On`.
  - If Target Fan Mode is `MANUAL` and Active is `INACTIVE` in Homekit, then the fan will be set to Honywell Mode `Circulate`.
  - If Target Fan Mode is `AUTO` and Active is `INACTIVE` in Homekit, then the fan will be set to Honywell Mode `Auto`.
  - If Target Fan Mode is `AUTO` and Active is `ACTIVE` in Homekit, then the fan will be set to Honywell Mode `Auto`.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.7...v5.1.0

## [Version 5.0.7](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.7) (2020-07-07)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.6...v5.0.7

## [Version 5.0.6](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.6) (2020-05-13)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.5...v5.0.6

## [Version 5.0.5](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.5) (2020-04-11)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.4...v5.0.5

## [Version 5.0.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.4) (2020-04-11)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.3...v5.0.4

## [Version 5.0.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.3) (2020-04-08)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.2...v5.0.3

## [Version 5.0.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.2) (2020-03-30)

### What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.1...v5.0.2

## [Version 5.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.1) (2020-03-26)

### What's Changes

- Honeywell - "rate limit has been exhausted" [\#106](https://github.com/donavanbecker/homebridge-honeywell-home/issues/106)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v5.0.0...v5.0.1

## [Version 5.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v5.0.0) (2020-03-22)

## What's Changes

- Secrets, Minimum TTL, Logging, Update Readme, and Changelog.md [\#112](https://github.com/donavanbecker/homebridge-honeywell-home/pull/112) ([donavanbecker](https://github.com/donavanbecker))
- Secrets, Minimum TTL and Logging [\#110](https://github.com/donavanbecker/homebridge-honeywell-home/pull/110) ([oznu](https://github.com/oznu))
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.4.4...v5.0.0

## [Version 4.4.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.4) (2020-03-20)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.4.3...v4.4.4

## [Version 4.4.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.3) (2020-03-16)

## What's Changes

- Minimist Vulnerability Update from 1.2.0 to 1.2.5

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.4.2...v4.4.3

## [Version 4.4.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.2) (2020-03-14)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.4.1...v4.4.2

## [Version 4.4.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.1) (2020-03-06)

## What's Changes

- Update to Config Schema to Support [Version 4.4.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.0) Rate limit Update
- Please refrain from setting your optional `ttl` config lower then 1800, to better support everyone that uses this plugin.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.4.0...v4.4.1

## [Version 4.4.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.4.0) (2020-03-06)

## What's Changes

- Made a [change](https://github.com/donavanbecker/homebridge-honeywell-home/blob/0ab08b50288b84faf40263952a85f3f5727f8e0e/index.js#L80) to the rate limit to better serve all users of this plugin that use it with [Config UI X](https://github.com/oznu/homebridge-config-ui-x)
- Hopefully this will help lower the `rate limit has been exhausted` log you may be getting.
- Please change your configs and `ttl` setting to be 1800 or more if you are setting it in options.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.3.2...v4.4.0

## [Version 4.3.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.3.2) (2020-03-05)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.3.1...v4.3.2

## [Version 4.3.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.3.1) (2020-02-21)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.3.0...v4.3.1

## [Version 4.3.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.3.0) (2020-02-15)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.2.0...v4.3.0

## [Version 4.2.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.2.0) (2020-02-06)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.1.1...v4.2.0

## [Version 4.1.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.1.1) (2020-01-23)

## What's Changes

- Update API Refresh to 10 minute minimum so that all users don't get refresh token errors.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.1.0...v4.1.1

## [Version 4.1.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.1.0) (2020-01-18)

## What's Changes

- Updated the API refresh so that it is to Honeywell's standards.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.0.4...v4.1.0

## [Version 4.0.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.0.4) (2020-01-17)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.0.3...v4.0.4

## [Version 4.0.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.0.3) (2020-01-16)

## What's Changes

- Added Changelog.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.0.2...v4.0.3

## [Version 4.0.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.0.2) (2020-01-10)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.0.1...v4.0.2

## [Version 4.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.0.1) (2020-01-09)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v4.0.0...v4.0.1

## [Version 4.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v4.0.0) (2020-01-07)

## What's Changes

- Adds the capability to write to the Honeywell Home API

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.5...v4.0.0

## [Version 3.0.5](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.5) (2020-01-04)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.4...v3.0.5

## [Version 3.0.4](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.4) (2020-01-04)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.3...v3.0.4

## [Version 3.0.3](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.3) (2020-01-03)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.2...v3.0.3

## [Version 3.0.2](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.2) (2020-01-03)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.1...v3.0.2

## [Version 3.0.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.1) (2020-01-02)

## What's Changes

- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v3.0.0...v3.0.1

## [Version 3.0.0](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v3.0.0) (2020-01-02)

## What's Changes

- Adds [@oznu](https://github.com/oznu)‘s zero-config portal ui for [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x)

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v2.6.1...v3.0.0

## [Version 2.6.1](https://github.com/donavanbecker/homebridge-honeywell-home/releases/tag/v2.6.1) (2020-01-01)

## What's Changes

- No Changelogs for 2.6.0 and Lower.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-honeywell-home/compare/v1.0.0...v2.6.1
