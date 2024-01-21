import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import logTree from 'console-log-tree'
import fs from 'fs'
import path from 'path'

import {
  GetCompatiableVersionsOfPackageFromGlobalStoreFile,
  GetPublishedPackageFromGlobalStoreFile,
  LoadZenGlobalStoreFile,
  ZENLOCKFILENAME,
  ZenLockFile,
} from '../utils/zen-files'

import semver = require('semver')

type Tree = {
  children?: Tree[]
  name: string
}
// import logtree = require('console-log-tree')

export default class List extends Command {
  static description = 'describe the command here'

  static flags = {
    tree: Flags.boolean({description: '@todo Log the dependency tree'}),
  }

  public async run(): Promise<void> {
    // const {flags} = await this.parse(List) TODO

    const lockPath = path.join(process.cwd(), ZENLOCKFILENAME)
    if (!fs.existsSync(lockPath)) {
      this.error(`No lock file exists: ${lockPath}`)
    }
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8')) as ZenLockFile
    const rootChildren: Tree[] = []
    for (const pkgn in lock.pkgs) {
      const pkg = lock.pkgs[pkgn]
      const _children: Tree[] = []
      const [publishedVersionOfPackage] = GetPublishedPackageFromGlobalStoreFile(pkgn, pkg.version_resolve)
      const IsUpdatedSignature = publishedVersionOfPackage.pack_signature === pkg.signature
      const signatureChalkColor = IsUpdatedSignature ? chalk.green : chalk.red
      _children.push({
        name: `${signatureChalkColor(pkg.signature)} ${chalk.gray(`(${publishedVersionOfPackage.pack_signature})`)}`,
      })

      /* Display import and traverse import status.
      if (pkg.import || pkg.traverse_imports) {
        if (pkg.import && !pkg.traverse_imports) {
          _children.push({name: 'imported'})
        } else if (pkg.traverse_imports && !pkg.import) {
          _children.push({name: 'imports traversed'})
        } else {
          _children.push({name: `imported & imports traversed`})
        }
      }
      */

      const compatVersion = GetCompatiableVersionsOfPackageFromGlobalStoreFile(pkgn, pkg.version)
      const currentIsLatestCompatVersion = pkg.version_resolve === compatVersion[0]
      const version_resolveChalkColor = currentIsLatestCompatVersion ? chalk.green : chalk.yellow
      rootChildren.push({
        children: _children,
        name: `${pkgn}@${pkg.version} = ${version_resolveChalkColor(pkg.version_resolve)}${
          currentIsLatestCompatVersion ? '' : ` - (version ${compatVersion[0]} is available)`
        }`,
      })

      const allVersionsOfPackage = LoadZenGlobalStoreFile().version_tree[pkgn]
      if (allVersionsOfPackage) {
        _children.push({
          name: allVersionsOfPackage
            .map((v) =>
              v === pkg.version_resolve
                ? chalk.green(chalk.underline(v))
                : semver.gt(v, pkg.version_resolve)
                ? chalk.yellow(v)
                : chalk.red(v),
            )
            .join(' | '),
        })
      }
    }

    const rootTree: Tree = {
      children: rootChildren,
      name: '(root)',
    }

    console.log(logTree.parse(rootTree)) // eslint-disable-line
  }
}
