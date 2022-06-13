import ElectronLog from 'electron-log'
import autoUpdaterPkg from 'electron-updater'
import fs from 'fs'
import { app, autoUpdater as builtinAutoUpdater, BrowserWindow, dialog, Notification } from './electron.cjs'

const { autoUpdater } = autoUpdaterPkg

const log = ElectronLog.scope('updater')

// must be global to avoid gc
let updateNotification = null

function setup (/** @type {import('./typings').Context} */ _ctx) {
  autoUpdater.autoDownload = false // we download manually in 'update-available'

  autoUpdater.on('error', err => log.error('error', err))
  autoUpdater.on('update-available', async (/* { version, releaseNotes } */) => {
    try {
      log.info('update-available, downloading..')
      await autoUpdater.downloadUpdate()
      log.info('update-available, downloaded')
    } catch (err) {
      log.error('update-available error', err)
    }
  })
  autoUpdater.on('update-not-available', (/* { version } */) => {
    log.info('update not available')
  })
  autoUpdater.on('update-downloaded', ({ version }) => {
    log.info(`update to ${version} downloaded`)
    const showUpdateDialog = () => {
      const opt = dialog.showMessageBoxSync({
        title: 'Update Filecoin Station',
        message: `An update to Filecoin Station ${version} is available. Would you like to install it now?`,
        type: 'info',
        buttons: ['Later', 'Install now']
      })
      if (opt === 1) { // install now
        setImmediate(async () => {
          await beforeQuitCleanup()
          autoUpdater.quitAndInstall()
        })
      }
    }
    // show unobtrusive notification + dialog on click
    updateNotification = new Notification({
      title: 'Filecoin Station Update',
      body: `An update to Filecoin Station ${version} is available.`
    })
    updateNotification.on('click', showUpdateDialog)
    updateNotification.show()
  })
  const beforeQuitCleanup = async () => {
    BrowserWindow.getAllWindows().forEach(w => w.removeAllListeners('close'))
    app.removeAllListeners('window-all-closed')
  }
  // built-in updater != electron-updater
  // https://github.com/electron-userland/electron-builder/pull/6395
  builtinAutoUpdater.on('before-quit-for-update', beforeQuitCleanup)
}

export async function setupUpdater (/** @type {import('./typings').Context} */ ctx) {
  if (['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
    // skip init in dev if we are not debugging updater
    if (!fs.existsSync('dev-app-update.yml')) return
  }

  setup(ctx)
  // TODO: replace this with autoUpdater.checkForUpdatesAndNotify()
  const checkForUpdates = async () => await autoUpdater.checkForUpdates()
  checkForUpdates() // async check on startup
  setInterval(checkForUpdates, 43200000) // every 12 hours
}
