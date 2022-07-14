## Overview

Filecoin Station uses [electron-build/auto-update](https://www.electron.build/auto-update) and a modified flow from [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder#electron-builder-action):

- `electron-builder` will create `.exe`, `.dmg` and `.AppImage` packages and output them to `./dist`
  - ℹ️ the type of produced artifact depends on OS used for build
  - ℹ️ locally built versions are neither signed nor notarized
- when running on CI (`.github/workflows/ci.yml`) our automation will
  - spawn separate worker for windows/macos/linux build
  - require passing tests before building packages
  - do the necessary signing and notarization (macOS)
    - ℹ️ builds from forks are neither signed nor notarized
  - attach created packages to GitHub Action's Summary page (valid for 90 days)
  - detect build for a tag, and create release draft with created packages and `.yml` auto-update manifests

## Making a new release

<!-- TODO: manual tag creation could be automated -->

1. Update `electron*` dependencies, if necessary.
2. Commit the changes.
3. Create a new feature branch, e.g. `release/A.B.C`
4. Update the package version using `npm --no-git-tag-version version A.B.C`
5. Commit the changes, use `release: vA.B.C` as the commit message
6. Open a pull request, wait for CI to finish, and then land the PR.
7. Pull the latest `main` branch to your machine, create a new tag and push it to GitHub:

    ```
    git checkout main
    git pull
    git tag -a -s vA.B.C
    # Set the commit message to "vA.B.C"
    git push origin vA.B.C
    ```

3.  Wait for GitHub Actions CI to upload the binaries to a draft release [here](https://github.com/filecoin-project/filecoin-station/releases) (a new one will be created if you haven't drafted one).
4. Review and publish the release draft.
   - Once a release is published, users will receive the app update
   - The `latest.yml, latest-mac.yml, latest-linux.yml` files attached to [/releases](https://github.com/filecoin-project/filecoin-station/releases) are used by the desktop app to determine when an app update is available.
5. Done!

### Old instructions that require admin access to the repo

1. Update `electron*` dependencies, if necessary.
2. Commit the changes.
3. Update the version using `npm version [major|minor|patch]` (it will create a new tag `vA.B.C`, note it down)
4. Publish local changes and the tag to the GitHub repo: `git push && git push origin vA.B.C`.
5. Wait for GitHub Actions CI to upload the binaries to a draft release [here](https://github.com/filecoin-project/filecoin-station/releases) (a new one will be created if you haven't drafted one).
6. Review and publish the release draft.
   - Once a release is published, users will receive the app update
   - The `latest.yml, latest-mac.yml, latest-linux.yml` files attached to [/releases](https://github.com/filecoin-project/filecoin-station/releases) are used by the desktop app to determine when an app update is available.
7. Done!

### Staged rollouts

To do a [staged rollout](https://www.electron.build/auto-update#staged-rollouts)
1. download `.yml` manifest files
2. append `stagingPercentage: 10` (% of userbase)
3. remove old `.yml` and re-upload patched ones

### Disabling rollout of a broken release

If your release is broken only on specific OS, set `stagingPercentage: 0` in respective `.yml`

This will make clients ignore the broken release. If you do this, ix has to be released under a new version.

### Apple Signing and Notarization

CI builds from main and other local branches
is signed and notarized using Protocol Labs Developer account.

Signing happens when env variables with certificate info is present:
- `MAC_CERTS` Certificate chain downloaded from apple website, as Base64 (`base64 -i certs.p12 > certs.txt`)
- `MAC_CERTS_PASSWORD` Certificate chain  password

Notarization is possible only if signing was successful.
It uses a separate set of credentials: `APPLE_ID` + `APPLE_ID_PASS`
(not a global account password, but app-specific one)
