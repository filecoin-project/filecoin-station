import { app } from './electron.cjs'

import { setupSaturnNode } from './saturn-node.js'
import { setupTray } from './tray.js'
import { setupUI } from './ui.js'
import { setupUpdater } from './updater.js'

export async function start (/** @type {import('./typings').Context} */ ctx) {
  await app.whenReady()

  // Interface
  await setupTray(ctx)
  await setupUI(ctx)
  await setupUpdater(ctx)

  await setupSaturnNode(ctx)
}
