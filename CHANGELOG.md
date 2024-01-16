# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/)

## [1.3.4](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.3.4) (2024-01-15)

### What's Changes
- fix August validation failure with verification codes starting with `0`. Thanks [@westhom](https://github.com/westhom), [#88](https://github.com/donavanbecker/homebridge-august/pull/88)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.3.3...v1.3.4

## [1.3.3](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.3.3) (2023-12-15)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.3.2...v1.3.3

## [1.3.2](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.3.2) (2023-11-26)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.3.1...v1.3.2

## [1.3.1](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.3.1) (2023-11-07)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.3.0...v1.3.1

## [1.3.0](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.2.1) (2023-10-31)

### What's Changes
- Add support for Yale Home with countryCode, Thanks [@hufftheweevil](https://github.com/hufftheweevil)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.2.1...v1.3.0

## [1.2.1](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.2.1) (2023-08-27)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.2.0...v1.2.1

## [1.2.0](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.2.0) (2023-08-19)

### What's Changes
- Fixed debugging issue, Thanks [@dacarson](https://github.com/dacarson) [#69](https://github.com/donavanbecker/homebridge-august/pull/69)
- Reduce August API calls, Thanks [@dacarson](https://github.com/dacarson) [#69](https://github.com/donavanbecker/homebridge-august/pull/69)
- Fix 'Locking...' and 'Unlocking...' issue, Thanks [@dacarson](https://github.com/dacarson) [#66](https://github.com/donavanbecker/homebridge-august/pull/66)
- Default Refresh Rate has been updated to limit the rate at which we refresh from August APIs.
  - This should fix any Status 429 Errors. [#55](https://github.com/donavanbecker/homebridge-august/issues/55)

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.1.1...v1.2.0

## [1.1.1](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.1.1) (2023-04-07)

### What's Changes
- Housekeeping and updated dependencies.
  - This release will end support for Node v14.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.1.0...v1.1.1

## [1.1.0](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.1.0) (2022-12-07)

### What's Changes
- Added option to `hide_lock` and only display Door Sense (Contact Sensor). [#26](https://github.com/donavanbecker/homebridge-august/issues/26)
- Fixed issue when DoorSense is not configured/in use. [#21](https://github.com/donavanbecker/homebridge-august/issues/21)
- Fixed TypeError: Cannot convert undefined or null to object. Thanks [@evantobin](https://github.com/evantobin)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.5...v1.1.0

## [1.0.5](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.5) (2022-10-09)

### What's Changes
- Fixed issue with RetryCount showing false `LockCurrentState` of `JAMMED`.

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.4...v1.0.5

## [1.0.4](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.4) (2022-10-07)

### What's Changes
- Remove Extra Logging

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.3...v1.0.4

## [1.0.3](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.3) (2022-10-07)

### What's Changes
- Quick Fix

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.2...v1.0.3

## [1.0.2](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.2) (2022-10-07)

### What's Changes
- Quick Fix

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.1...v1.0.2

## [1.0.1](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.0) (2022-10-07)

### What's Changes
- Quick Fix

**Full Changelog**: https://github.com/donavanbecker/homebridge-august/compare/v1.0.0...v1.0.1

## [1.0.0](https://github.com/donavanbecker/homebridge-august/releases/tag/v1.0.0) (2022-10-07)

### What's Changes
- Initial Release
- Add Support to Subscribe to Events from a Lock
- Allows for displaying Lock as external Device not linkced to Bridge
- Support for Lock Door Sense to be displayed as Contact Sensor