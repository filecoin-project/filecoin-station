import { fileURLToPath } from 'node:url'
import path from 'path'
import { IS_MAC, STATION_VERSION } from './consts.js'
import { app, Menu, shell, Tray } from './electron.cjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Be warned, this one is pretty ridiculous:
// Tray must be global or it will break due to.. GC.
// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray = null

const on = 'on'
// const off = 'off'

function icon (/** @type {'on' | 'off'} */ state) {
  const dir = path.resolve(path.join(dirname, '../assets/tray'))
  if (IS_MAC) return path.join(dir, `${state}-macos.png`)
  return path.join(dir, `${state}.png`)
}

export function setupTray (/** @type {import('./typings').Context} */ ctx) {
  tray = new Tray(icon(on))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Filecoin Station v${STATION_VERSION}`,
      click: () => { shell.openExternal(`https://github.com/filecoin-project/filecoin-station/releases/v${STATION_VERSION}`) }
    },
    { type: 'separator' },
    {
      id: 'showUi',
      label: 'Show UI',
      click: () => ctx.showUI()
    },
    { type: 'separator' },
    {
      label: 'Quit Station',
      click: () => app.quit(),
      accelerator: IS_MAC ? 'Command+Q' : undefined
    }
  ])
  tray.setToolTip('Filecoin Station')
  tray.setContextMenu(contextMenu)
}
