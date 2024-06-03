import chalk from 'chalk'
import {execSync} from 'child_process'
import path from 'path'
import fs from 'fs'

import {package_json_read_file} from './zen-core'
import {GetZenHomeConfigParam, LoadZenHomeDirPackages} from './zen-files'

export function UpdateGitRepositoryZenHomeConfig() {
  const PublishToGitRepo = GetZenHomeConfigParam('PublishZenToGit')
  if (typeof PublishToGitRepo !== 'string') {
    return
  }
  if (PublishToGitRepo.match(/^@--/)) {
    return // contains the headsup default text.
  }
  const Packages = LoadZenHomeDirPackages()
  try {
    if (!fs.existsSync(path.join(Packages, '.git'))) {
      execSync('git init', {cwd: Packages, stdio: 'inherit'})
    }
  } catch (err) {
    console.warn(
      `An error occurred while trying to publish the zen home config packages to your github repo! => ${err}`,
    )
  }
}
/**
 * Adds the files to git and commits with the message provided.
 *
 * @param files The files to add
 * @param message The commit message
 * @param usePackageJson A read `package.json` file. Should be of the cwd or the json that contains the "zen" field
 * that handles git for the package.
 * @returns void
 */
export function AddAndCommitToGit(files: string[], message: string, usePackageJson: package_json_read_file) {
  const _zengit = usePackageJson['.zen']?.git ?? {}
  if (_zengit.auto !== true) {
    return
  }
  let commitMessage = `${_zengit.prefix ?? '(zen) '}${message}`
  if (typeof _zengit.trimCommitMessages === 'number') {
    commitMessage =
      commitMessage.length > _zengit.trimCommitMessages
        ? commitMessage.substring(0, _zengit.trimCommitMessages - 3) + '...'
        : commitMessage
  }
  console.log(
    chalk.gray(`Committing "${commitMessage}" to ${files.map((x) => path.relative(process.cwd(), x)).join(',')}`),
  )
  try {
    execSync(`git add ${files.join(' ')}`, {stdio: _zengit.suppressLogs ? 'ignore' : 'inherit'})
    execSync(`git commit ${files.join(' ')} -m "${commitMessage}"`, {
      stdio: _zengit.suppressLogs ? 'ignore' : 'inherit',
    })
  } catch (err) {
    console.warn(chalk.yellow('Something went wrong with adding and committing to git. ERROR: ') + err)
  }
}
