/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/* jshint node: true,esversion: 9, -W014, -W033 */
/* eslint-disable new-cap */
'use strict';

const { HomebridgePluginUiServer } = require('@homebridge/plugin-ui-utils');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const http = require('http');
const url = require('url');

class PluginUiServer extends HomebridgePluginUiServer {
  constructor() {
    super();
    this.onRequest('Start Resideo Login Server', () => {
      const runningServer = http.createServer(async (req, res) => {
        try {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          const urlParts = url.parse(req.url, true);
          const pathArr = urlParts.pathname.split('?');
          const action = pathArr[0].replace('/', '');
          const query = urlParts.query;
          switch (action) {
            case 'start': {
              this.key = query.key;
              this.secret = query.secret;
              this.hostname = query.host;
              const url = 'https://api.honeywell.com/oauth2/authorize?' +
                'response_type=code&redirect_uri=' + encodeURI('http://' + this.hostname + ':8585/auth') + '&' +
                'client_id=' + query.key;
              res.end('<script>window.location.replace(\'' + url + '\');</script>');
              break;
            }
            case 'auth': {
              if (query.code) {
                const code = query.code;
                const auth = Buffer.from(this.key + ':' + this.secret).toString('base64');
                let curlString = '';
                curlString += 'curl -X POST ';
                curlString += '--header "Authorization: Basic ' + auth + '" ';
                curlString += '--header "Accept: application/json" ';
                curlString += '--header "Content-Type: application/x-www-form-urlencoded" ';
                curlString += '-d "';
                curlString += 'grant_type=authorization_code&';
                curlString += 'code=' + code + '&';
                curlString += 'redirect_uri=' + encodeURI('http://' + this.hostname + ':8585/auth');
                curlString += '" ';
                curlString += '"https://api.honeywell.com/oauth2/token"';
                try {
                  const { stdout } = await exec(curlString);
                  const response = JSON.parse(stdout);
                  if (response.access_token) {
                    this.pushEvent('creds-received', {
                      key: this.key,
                      secret: this.secret,
                      access: response.access_token,
                      refresh: response.refresh_token,
                    });
                    res.end('Success. You can close this window now.');
                  } else {
                    res.end('oops.');
                  }
                } catch (err) {
                  res.end('<strong>An error occurred:</strong><br>' + JSON.stringify(err) + '<br><br>Close this window and start again');
                }
              } else {
                res.end('<strong>An error occurred:</strong><br>no code received<br><br>Close this window and start again');
              }
              break;
            }
            default: {
              // should never happen
              res.end('welcome to the server');
              break;
            }
          }
        } catch (err) {
          console.log(err);
        }
      });
      runningServer.listen(8585, err => {
        if (err) {
          console.log(err);
        }
      });

      setTimeout(() => {
        runningServer.close();
      }, 300000);
    });


    /*
      A native method getCachedAccessories() was introduced in config-ui-x v4.37.0
      The following is for users who have a lower version of config-ui-x
    */


    this.onRequest('/getCachedAccessories', async () => {
      try {
        // Define the plugin and create the array to return
        const plugin = 'homebridge-resideo';
        const devicesToReturn = [];

        // The path and file of the cached accessories
        const accFile = this.homebridgeStoragePath + '/accessories/cachedAccessories';

        // Check the file exists
        if (fs.existsSync(accFile)) {
          // Read the cached accessories file
          let cachedAccessories = await fs.promises.readFile(accFile);

          // Parse the JSON
          cachedAccessories = JSON.parse(cachedAccessories);

          // We only want the accessories for this plugin
          cachedAccessories
            .filter(accessory => accessory.plugin === plugin)
            .forEach(accessory => devicesToReturn.push(accessory));
        }

        // Return the array
        return devicesToReturn;
      } catch (err) {
        // Just return an empty accessory list in case of any errors
        return [];
      }
    });
    this.ready();
  }
}

(() => new PluginUiServer())();
