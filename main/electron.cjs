// A thin wrapper for 'electron` package to expose CommonJS API for ES Module consumption

const electron = require('electron')

exports.BrowserWindow = electron.BrowserWindow
exports.autoUpdater = electron.autoUpdater
exports.dialog = electron.dialog
exports.Menu = electron.Menu
exports.Notification = electron.Notification
exports.Tray = electron.Tray
exports.app = electron.app
exports.screen = electron.screen
exports.shell = electron.shell
