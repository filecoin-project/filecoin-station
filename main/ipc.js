const { ipcMain } = require('electron')

const saturnNode = require('./saturn-node')

module.exports = function () {
  ipcMain.handle('saturn:isRunning', saturnNode.isRunning)
  ipcMain.handle('saturn:isReady', saturnNode.isReady)
  ipcMain.handle('saturn:start', saturnNode.start)
  ipcMain.handle('saturn:stop', saturnNode.stop)
  ipcMain.handle('saturn:getLog', saturnNode.getLog)
  ipcMain.handle('saturn:getWebUrl', saturnNode.getWebUrl)
  ipcMain.handle('saturn:getFilAddress', saturnNode.getFilAddress)
  ipcMain.handle('saturn:setFilAddress', (_event, address) => saturnNode.setFilAddress(address))
}
