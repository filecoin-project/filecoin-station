# Developer Guide

## Development workflow

Run `npm start` to open the Electron app and load the WebUI via the Vite DEV server. Changes made
inside `renderer` files will be immediately applied in the running app.

Run `npm lint` to check for coding style issues and type errors.

## Updating to a new major version of Electron/Chromium

After updating to a newer Chromium version, update the compilation target for `renderer` files
in [vite.config.js](./../vite.config.js).
