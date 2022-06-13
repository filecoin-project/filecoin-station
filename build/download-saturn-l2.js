#!/usr/bin/env -S node

import gunzip from 'gunzip-maybe'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import tar from 'tar-fs'
import { request } from 'undici'

const SATURN_DIST_TAG = 'v0.0.2'

const githubToken = process.env.GITHUB_TOKEN
const authorization = githubToken ? `Bearer ${githubToken}` : undefined

console.log('Fetching release metadata for %s', SATURN_DIST_TAG)
console.log('GitHub client:', authorization ? 'authorized' : 'anonymous')

const { assets } = await fetchReleaseMetadata()

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dirname, 'saturn')
await mkdir(outDir, { recursive: true })

await Promise.all(
  assets
    .map(async ({ name, browser_download_url: url }) => {
      const match = name.match(/^saturn-l2_\d+\.\d+\.\d+_([A-Za-z0-9]+)_([A-Za-z0-9_]+)\.tar\.gz$/)
      const platform = match && getPlatform(match[1])
      if (!match || platform !== process.platform) {
        console.log(' ⨯ skipping %s', name)
        return
      }

      const outName = `l2node-${platform}-${getArch(match[2])}`
      console.log(' ⇣ downloading %s', outName)
      const res = await request(url, {
        headers: { authorization },
        maxRedirections: 5
      })

      if (res.statusCode >= 300) {
        throw new Error(
            `Cannot fetch saturn-l2 binary ${name}: ${res.statusCode}\n${await res.body.text()}`
        )
      }

      const outFile = path.join(outDir, outName)
      await pipeline(res.body, gunzip(), tar.extract(outFile))
      console.log(' ✓ %s', outFile)
    })
)

console.log('✨ DONE ✨')

/**
 * @returns {Promise<{
 *  assets: {name:string, browser_download_url: string}[];
 * }>}
 */
async function fetchReleaseMetadata () {
  const res = await request(
    `https://api.github.com/repos/filecoin-project/saturn-l2/releases/tags/${SATURN_DIST_TAG}`,
    {
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'undici',
        authorization
      }
    }
  )
  if (res.statusCode >= 300) {
    throw new Error(`Cannot fetch saturn-l2 release ${SATURN_DIST_TAG}: ${res.statusCode}\n${await res.body.text()}`)
  }
  const data = await res.body.json()
  return data
}

/**
 * @param {string} golangOs
 */
function getPlatform (golangOs) {
  switch (golangOs) {
    case 'Windows': return 'win32'
    case 'Linux': return 'linux'
    case 'Darwin': return 'darwin'
  }
  throw new Error(`Unkown OS string: ${golangOs}`)
}

/**
 * @param {string} golangArch
 */
function getArch (golangArch) {
  switch (golangArch) {
    case 'x86_64':
      return 'x64'
    case 'i386':
      return 'ia32'
    case 'arm64':
      return 'arm64'
  }

  throw new Error(`Unkown ARCH string: ${golangArch}`)
}
