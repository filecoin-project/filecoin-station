import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'os'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const packageFile = path.resolve(dirname, '..', 'package.json')
const packageJson = JSON.parse(await fs.readFile(packageFile, { encoding: 'utf-8' }))

export const IS_MAC = os.platform() === 'darwin'
export const IS_WIN = os.platform() === 'win32'
export const IS_APPIMAGE = typeof process.env.APPIMAGE !== 'undefined'
export const STATION_VERSION = packageJson.version
export const ELECTRON_VERSION = process.versions.electron
