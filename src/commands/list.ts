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
import {UpdateGitRepositoryZenHomeConfig} from '../utils/git'

type Tree = {
  children?: Tree[]
  name: string
}
// import logtree = require('console-log-tree')

export default class List extends Command {
  static description = 'Lists installed zen packages and their dependencies.'

  static flags = {
    tree: Flags.boolean({description: '@todo Log the dependency tree'}),
  }

  public async run(): Promise<void> {
    // const {flags} = await this.parse(List) TODO

    UpdateGitRepositoryZenHomeConfig()

    const lockPath = path.join(process.cwd(), ZENLOCKFILENAME)
    if (!fs.existsSync(lockPath)) {
      this.error(`No lock file exists: ${lockPath}`)
    }
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8')) as ZenLockFile
    const zenGlobalFile = LoadZenGlobalStoreFile()
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

      const allVersionsOfPackage = zenGlobalFile.version_tree[pkgn]
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
      name: '',
    }

    const treeChildren: Tree[] = []
    for (const treeItemNamesText in lock.tree) {
      const treeItemNames = treeItemNamesText.split('>>')
      const treeItemTargetPackage = treeItemNames[treeItemNames.length - 1]
      const treeItemSignature = lock.tree[treeItemTargetPackage]
      const treeItemsTextWithTargetHighlighted =
        chalk.gray(
          treeItemNames
            .map((x) => (x === treeItemTargetPackage ? undefined : x))
            .filter(Boolean)
            .join('>>') + '>>',
        ) + treeItemTargetPackage
      const inStore = zenGlobalFile.store[treeItemTargetPackage]
      if (!inStore) {
        treeChildren.push({
          children: [{name: chalk.red(`${treeItemTargetPackage} was not found in the global store!`)}],
          name: treeItemsTextWithTargetHighlighted,
        })
        continue
      }
      treeChildren.push({
        children: [
          {
            name:
              treeItemSignature === inStore.pack_signature
                ? chalk.red(inStore.pack_signature)
                : chalk.green(inStore.pack_signature),
          },
        ],
        name: treeItemsTextWithTargetHighlighted,
      })
    }
    const treeTree: Tree = {
      children: treeChildren,
      name: '',
    }

    const log: Tree = {
      children: [
        {children: rootTree.children, name: '(root)'},
        {children: treeTree.children, name: '(tree)'},
      ],
      name: 'zen list',
    }
    console.log(logTree.parse(log)) // eslint-disable-line
  }
}
