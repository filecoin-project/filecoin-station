import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, screen } from './electron.cjs'
import { store } from './store.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @param {import('./typings').Context} ctx
 * @returns {Promise<import('electron').BrowserWindow>}
 */
export async function setupUI (ctx) {
  // Show docks only when UI is visible
  if (app.dock) app.dock.hide()

  const dimensions = screen.getPrimaryDisplay().size
  const ui = new BrowserWindow({
    title: 'Filecoin Station',
    show: false, // we show it via ready-to-show
    width: store.get('ui.width', dimensions.width < 1440 ? dimensions.width : 1440),
    height: store.get('ui.height', dimensions.height < 900 ? dimensions.height : 900),
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false
      // TODO: preload: path.join(__dirname, 'preload.js')
    }
  })

  /** @type {import('vite').ViteDevServer} */
  let devServer

  if (app.isPackaged || process.env.NODE_ENV !== 'development') {
    ctx.loadWebUIFromDist(ui)
  } else {
    console.log('Starting Vite DEV server')
    // Import vite only in DEV mode, we are not bundling vite dependency in the production package
    const { createServer } = await import('vite')
    devServer = await createServer({
      configFile: path.resolve(dirname, '..', 'vite.config.js'),
      server: {
        port: 3000
      }
    })
    await devServer.listen()

    console.log('Installing React developer tools')

    const pkg = await import('electron-devtools-installer')
    const { REACT_DEVELOPER_TOOLS } = pkg
    /** @type {typeof import('electron-devtools-installer').default} */
    const installExtension = (/** @type {any} */ (pkg.default)).default
    //                        ^^ this cast to `any` is a workaround for broken exports in the module

    await installExtension(REACT_DEVELOPER_TOOLS).then(
      name => console.log('Added extension:', name),
      error => console.error('Cannot install React developer tools:', error)
    )

    console.log('Opening DevTools')
    ui.webContents.openDevTools()

    console.log('Loading the WebUI')
    ui.loadURL('http://localhost:3000/')
  }

  // UX trick to avoid jittery UI while browser initializes chrome
  ctx.showUI = () => {
    if (app.dock) app.dock.show()
    ui.show()
  }
  ui.once('ready-to-show', ctx.showUI)

  // Don't exit when window is closed (Quit only via Tray icon menu)
  ui.on('close', (event) => {
    event.preventDefault()
    ui.hide()
    if (app.dock) app.dock.hide()
  })

  // When true quit is triggered we need to remove listeners
  // that were added to keep app running when the UI is closed.
  // (Without this, the app would run forever and/or fail to update)
  app.on('before-quit', () => {
    ui.removeAllListeners('close')
    devServer?.close()
  })

  return ui
}
