import Store from 'electron-store'
import { app } from './electron.cjs'

const defaults = {
  // https://github.com/sindresorhus/electron-store#defaults
  language: app.getLocale() // useful for i18n
}

/** @type {import('electron-store').Options<{language: string}>["migrations"]} */
const migrations = {
  // https://github.com/sindresorhus/electron-store#migrations
}

export const store = new Store({
  defaults,
  migrations
})
