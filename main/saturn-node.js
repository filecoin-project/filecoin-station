import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { app } from './electron.cjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export async function setupSaturnNode (/** @type {import('./typings').Context} */ _ctx) {
  const saturnBinaryPath = getSaturnBinaryPath()
  console.log('Using Saturn L2 Node binary: %s', saturnBinaryPath)

  const stat = await fs.stat(saturnBinaryPath)
  if (!stat) {
    throw new Error(`Invalid configuration or deployment. Saturn L2 Node was not found: ${saturnBinaryPath}`)
  }

  console.log('todo: start saturn node')
}

function getSaturnBinaryPath () {
  const name = 'saturn-l2' + (process.platform === 'win32' ? '.exe' : '')
  return app.isPackaged
    ? path.resolve(process.resourcesPath, 'saturn-l2-node', name)
    : path.resolve(dirname, '..', 'build', 'saturn', `l2node-${process.platform}-${process.arch}`, name)
}
