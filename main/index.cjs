'use strict'

// This is the entry point for the Electron main process.
// We must use CommonJS format because Electron does not support ES Modules in the main process yet:
// https://github.com/electron/electron/issues/21457

const { app, dialog } = require('electron')
const log = require('electron-log')
const serve = require('electron-serve')
const path = require('node:path')

const inTest = (process.env.NODE_ENV === 'test')

function handleError (/** @type {any} */ err) {
  log.error(err)
  dialog.showErrorBox('Error occurred', err.stack ?? err.message ?? err)
}

// ensures there are no unhandled errors during initial dev
process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

// Sets User Model Id so notifications work on Windows 10
// To show notifications properly on Windows, we must manually set the appUserModelID
// See https://www.electronjs.org/docs/tutorial/notifications#windows
if (process.platform === 'win32') {
  app.setAppUserModelId('io.filecoin.station')
}

// Only one instance can run at a time
if (!app.requestSingleInstanceLock() && !inTest) {
  app.quit()
}

/** @type {import('./typings').Context} */
const ctx = {
  showUI: () => { throw new Error('never get here') },
  loadWebUIFromDist: serve({ directory: path.resolve(__dirname, '../renderer/dist') })
}

import('./main.js')
  .then(main => main.start(ctx))
  .catch(err => {
    handleError(err)
    process.exit(1)
  })
