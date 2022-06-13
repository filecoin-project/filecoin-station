const { notarize } = require('electron-notarize')

const isSet = (/** @type {string | undefined} */ value) => value && value !== 'false'

/**
 * electron-build hook responsible for Apple Notarization of signed DMG
 *
 * @param {import('electron-builder').AfterPackContext} context
 */
exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') return
  // skip notarization if secrets are not present in env
  if (!process.env.APPLEID || !process.env.APPLEIDPASS) return
  // skip notarization when signing is disabled in PRs
  // https://github.com/electron-userland/electron-builder/commit/e1dda14
  if (isSet(process.env.TRAVIS_PULL_REQUEST) ||
    isSet(process.env.CI_PULL_REQUEST) ||
    isSet(process.env.CI_PULL_REQUESTS)) return

  const appName = context.packager.appInfo.productFilename

  return notarize({
    appBundleId: 'io.filecoin.station',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
}
