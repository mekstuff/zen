import {AddAndCommitToGit} from './git'
import {ParsePackageString, ParseToPublishableName} from './parsers'
import {
  GetCompatiableVersionsOfPackageFromGlobalStoreFile,
  GetPublishedPackageFromGlobalStoreFile,
  LoadZenGlobalStoreFile,
  SaveZenGlobalStoreFile,
  ZENLOCKFILENAME,
  ZENLOCKVERSION,
  ZenLockFile,
} from './zen-files'

import chalk = require('chalk')

const parseJson = require('json-parse-even-better-errors')
import crypto = require('crypto')
import fs = require('fs')
import path = require('path')

type package_json_zendependency = Pick<ZenLockFile['pkgs'][string], 'import' | 'traverse_imports' | 'version'>
/**
 * A type that represents a `package.json` file with parameters based on what zen needs.
 */
export type package_json_read_file = {
  ['.zen']?: {
    /**
     * Similar to "dependencies" of the package.json
     */
    dependencies?: Record<string, package_json_zendependency>
    /**
     * Similar to "devDependencies" of the package.json
     */
    devDependencies?: Record<string, package_json_zendependency>
    git?: {
      /**
       * Automatically make commits to git whenever zen makes changes
       */
      auto?: boolean
      /**
       * Allows commits to the `package.json` file in cases where zen may have changed its contents.
       */
      packageCommits?: boolean
      /**
       * The prefix that will be appended at the start of each commit zen makes - defaults to `(zen): `
       */
      prefix?: string
      /**
       * Hides the commit logs by git in the terminal.
       */
      suppressLogs?: boolean
      /**
       * A cutoff length for commit messages.
       */
      trimCommitMessages?: number
    }
    /**
     * Similar to "optionalDependencies" of the package.json
     */
    optionalDependencies?: Record<string, package_json_zendependency>
    /**
     * Similar to "peerDependencies" of the package.json
     */
    peerDependencies?: Record<string, package_json_zendependency>
  }
  dependencies?: Record<string, string>
  description: string
  devDependencies?: Record<string, string>
  name: string
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  version: string
}

/**
 * Reads the `package.json` file from the cwd. If no files exists it will throw an error.
 *
 * @param options {}
 *
 * @returns {package_json_read_file} A representation type of a `package.json` file that contains fields for zen.
 */
export function ReadExistingPackageJSON<R_F extends string[]>(options?: {
  cwd?: string
  requires_fields?: R_F
}): package_json_read_file {
  const tcwd = options?.cwd || process.cwd()
  const PackageJSONPath = path.join(tcwd, 'package.json')
  if (!fs.existsSync(PackageJSONPath)) {
    throw 'package.json file does not exist in the directory: ' + tcwd
  }
  try {
    const read = parseJson(fs.readFileSync(PackageJSONPath, 'utf-8'))
    if (options && options.requires_fields) {
      options.requires_fields.forEach((field) => {
        if (read[field] === undefined) {
          throw `Missing "${field}" field from package.json file in: ${tcwd}`
        }
      })
    }
    return read as package_json_read_file
  } catch (err) {
    throw `Failed to read or parse package.json file at ${tcwd} because: ${err}`
  }
}
/**
 * Writes the `package.json` file from the cwd. If no files exists it will throw an error.
 *
 * @param options {}
 * @returns void
 */
export function WriteExistingPackageJSON(options: {ReadJSON: package_json_read_file; cwd?: string}) {
  const tcwd = options?.cwd || process.cwd()
  const PackageJSONPath = path.join(tcwd, 'package.json')
  if (!fs.existsSync(PackageJSONPath)) {
    throw 'package.json file does not exist in the directory: ' + tcwd
  }
  const prevStr = fs.readFileSync(PackageJSONPath, 'utf-8')
  const existingJsonParsed = parseJson(prevStr)
  const indent = Symbol.for('indent')
  const str = JSON.stringify(options.ReadJSON, null, existingJsonParsed[indent])
  if (str === existingJsonParsed) {
    return
  }
  try {
    fs.writeFileSync(PackageJSONPath, str)
  } catch (err) {
    throw `Failed to write or parse package.json file at ${tcwd} because: ${err}`
  }
}

export type zen_package_tree_dependency = package_json_zendependency & {name: string}
type zen_package_tree = (zen_package_tree_dependency & {
  pack_signature: string
  publish_resolve: string
  version_resolve: string
  /**
   * If this package was the result of another package that has "traverse_imports" to true, then this will be throw
   */
  was_traversed?: string
})[]

/**
 * Generates an array with all the packages and where they should be resolved. this will "hoist" every package onto a flat list
 * for e.g. if a package has traverse imports, it will get all those packages as well.
 *
 * @param rootPackages zen_package_tree_dependency[]
 *
 * @returns {zen_package_tree} the package tree.
 */
export function GenerateZenPackagesTree(rootPackages: zen_package_tree_dependency[]): zen_package_tree {
  const tree: zen_package_tree = []

  const GenTree = (packages: zen_package_tree_dependency[], traverseStr?: string) => {
    packages.forEach((Package) => {
      // We use the latest compatiable version based on the `Package.version` to add to the tree
      // So if the `Package.version` were to be `^2.0.0` and a published version of `2.5.1` exists,
      // `2.5.1` will be used
      const [packagePublishInfo, publishName] = GetPublishedPackageFromGlobalStoreFile(
        Package.name,
        GetCompatiableVersionsOfPackageFromGlobalStoreFile(Package.name, Package.version)[0] ?? Package.version,
        true,
      )
      const version_resolve = ParsePackageString(publishName).version ?? ''
      if (Package.traverse_imports && !Package.import) {
        console.warn(
          chalk.yellow(
            `Did you mean to traverse_imports of ${publishName} and not import it aswell? The traversed imports will not be used as the package was not imported.`,
          ),
        )
      }
      tree.push({
        ...Package,
        pack_signature: packagePublishInfo.pack_signature,
        publish_resolve: packagePublishInfo.resolve,
        version_resolve: version_resolve,
        was_traversed: traverseStr
          ? traverseStr + '>>' + ParseToPublishableName(Package.name, version_resolve)
          : undefined,
      })
      // if traversing_imports then we read the lock file of the published package to get what packages it has installed,
      // we then grab those packages and add them to the tree and repeat the process.

      // we traverse every package even without "traverse_imports" being true, this is so that if we have:
      // lib0,lib1,lib2; lib1 has lib0 installed and lib2 has lib1 installed. If lib0 were to update
      // without traversing, lib2 will not pull lib0 unless lib1 was upgraded aswell.
      const packagePublishInfoLockFilePackageJsonPath = path.join(packagePublishInfo.resolve, ZENLOCKFILENAME)
      if (fs.existsSync(packagePublishInfoLockFilePackageJsonPath)) {
        const packagePublishInfoLockFile = JSON.parse(
          fs.readFileSync(packagePublishInfoLockFilePackageJsonPath, 'utf-8'),
        ) as ZenLockFile

        // traverse imports
        const _totraverse: zen_package_tree_dependency[] = []
        for (const lockPkgName in packagePublishInfoLockFile.pkgs) {
          const lockPkg = packagePublishInfoLockFile.pkgs[lockPkgName]
          _totraverse.push({
            import: Package.traverse_imports, // import will be what traverse_imports is for root package
            name: lockPkgName,
            traverse_imports: Package.traverse_imports ?? lockPkg.traverse_imports, // traverse_imports will be either the Parent's package traverse_imports or our items specified traverse import.
            // ^^ this means if at root we traverse imports for a package, all descendants/dependencies/sub-dependencies of that package should be imported
            // ^^ if it's a case where a root package doesn't traverse imports but a sub-package does, that sub-package dependencies will should follow this ^ rule.
            version: lockPkg.version,
          })
        }
        if (_totraverse.length > 0) {
          GenTree(_totraverse, ParseToPublishableName(Package.name, version_resolve))
        }
      }
    })
  }
  GenTree(rootPackages)
  return tree
}

/**
 * Hashes a `package.json` file so we can save it with the pack_signature to then be able to use it in a .lock file
 * to know if a packages package.json changed which means we most likely need to install with a package manager instead of
 * just copying to node_modules.
 *
 * @param PackageJsonPath The path of the package.json file.
 * @returns the hash string.
 */
export function HashPackageJsonFileAsync(PackageJsonPath: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const fd = fs.createReadStream(PackageJsonPath)
    const hash = crypto.createHash('sha1')
    hash.setEncoding('hex')

    fd.on('end', function () {
      hash.end()
      resolve(hash.read())
    })

    fd.pipe(hash)
  })
}

/**
 * Resolves the Zen packages tree, Responsible for loading packages into `./zen` directory if they were imported, etc.
 *
 * It also generates the lock file and uses the previous lock file (if any) to determine what packages need to be updated.
 *
 * @param Tree The zen_package_tree generated by `GenerateZenPackagesTree` function.
 * @param cwd The current working directory.
 * @param packageJSON The read package json to remove any dependencies from if packages were detected to have been removed. (will not write to the package.)
 *
 *
 * @returns a tuple with 0 being array packages with their respective resolved path that should be added to package.json and 1 being an array of packages that were removed (they were also deleted from the package.json that was passed.)
 */
export function ResolveZenPackagesTree(
  Tree: zen_package_tree,
  cwd: string,
  packageJSON: package_json_read_file,
): [{name: string; resolvedPackagePath: string}[], {name: string; version_resolve: string}[]] {
  const treeResults: {name: string; resolvedPackagePath: string}[] = []
  const removedItems: {name: string; version_resolve: string}[] = []
  const LOCKFILEPATH = path.join(cwd, ZENLOCKFILENAME)
  const zenRootDirectory = path.relative(cwd, '.zen')
  const toZenDirectoryImportPackageName = (name: string, version: string): string => {
    // return name.replace(/\//g, '_') + `@${version}` + '--' + pack_signature.replace(/\//g, '_')
    // return name.replace(/\//g, '_') + `@${version}`
    return name + `@${version}`
  }
  let RequiresPackageManagerInstall: zen_package_tree = []
  let RequiresPackageInjection: zen_package_tree = []
  let OLD_LOCK_FILE_DATA: ZenLockFile
  if (fs.existsSync(LOCKFILEPATH)) {
    const r = JSON.parse(fs.readFileSync(LOCKFILEPATH, 'utf-8')) as ZenLockFile
    if (r.version === ZENLOCKVERSION) {
      // if the lock versions are the same, consume the old data
      OLD_LOCK_FILE_DATA = r
    } else {
      OLD_LOCK_FILE_DATA = {
        pkgs: {},
        tree: {},
        version: ZENLOCKVERSION,
      }
    }
  } else {
    OLD_LOCK_FILE_DATA = {pkgs: {}, tree: {}, version: ZENLOCKVERSION}
  }
  for (const oldPackageName in OLD_LOCK_FILE_DATA.pkgs) {
    const oldPackage = OLD_LOCK_FILE_DATA.pkgs[oldPackageName]
    const OldInLockIsSameAsInTree =
      Tree.findIndex((pkg) => pkg.name === oldPackageName && pkg.version === oldPackage.version) !== -1
    if (!OldInLockIsSameAsInTree) {
      removedItems.push({
        name: oldPackageName,
        version_resolve: oldPackage.version_resolve,
      })
    }
  }
  const LOCK_FILE_DATA: ZenLockFile = {
    pkgs: {},
    tree: {},
    version: ZENLOCKVERSION,
  }
  Tree.forEach((item) => {
    // only run these for top level/root level packages
    if (!item.was_traversed) {
      // Lock file
      const OLD_ITEM_DATA_FROM_LOCK = OLD_LOCK_FILE_DATA.pkgs[item.name] || {}
      const old_packsignature = OLD_ITEM_DATA_FROM_LOCK.signature ?? ''

      const old_packsignature_packagehash = old_packsignature.split('=')[1]
      const item_packsignature_packagehash = item.pack_signature.split('=')[1]

      // the packagehash has changed, so install with package manager incase new dependencies were added and/or bin files changed etc.
      if (old_packsignature_packagehash !== item_packsignature_packagehash) {
        RequiresPackageManagerInstall.push(item)
      }
      // the signature is different meaning the source has changed.
      if (old_packsignature !== item.pack_signature) {
        RequiresPackageInjection.push(item)
      }

      // changed import status, inject
      if (
        OLD_ITEM_DATA_FROM_LOCK.import !== item.import ||
        OLD_ITEM_DATA_FROM_LOCK.traverse_imports !== item.traverse_imports
      ) {
        RequiresPackageInjection.push(item)
      }

      // path does not exist, e.g. not inside `.zen` or `node_modules`, inject
      if (item.import) {
        if (
          !fs.existsSync(path.join(zenRootDirectory, toZenDirectoryImportPackageName(item.name, item.version_resolve)))
        ) {
          RequiresPackageInjection.push(item)
        }
      } else {
        if (!fs.existsSync(path.join(cwd, 'node_modules', item.name))) {
          RequiresPackageInjection.push(item)
        }
      }

      // update the the LOCK_FILE_DATA
      LOCK_FILE_DATA.pkgs[item.name] = {
        import: item.import,
        signature: item.pack_signature,
        traverse_imports: item.traverse_imports,
        version: item.version,
        version_resolve: item.version_resolve,
      }

      // tree results of top level packages are returned, so that they can be placed inside package.json
      treeResults.push({
        name: item.name,
        resolvedPackagePath: item.import
          ? path.join(zenRootDirectory, toZenDirectoryImportPackageName(item.name, item.version_resolve))
          : item.publish_resolve,
      })
    } else {
      // dep of dep / traversed package
      const _oldTraverseSignatureInTree: string | undefined = OLD_LOCK_FILE_DATA.tree[item.was_traversed]
      if (_oldTraverseSignatureInTree) {
        const currSignatureSplit = item.pack_signature.split('=')
        const oldSignatureSplit = _oldTraverseSignatureInTree.split('=')
        if (currSignatureSplit[1] !== oldSignatureSplit[1]) {
          // the package.json changed, install
          RequiresPackageManagerInstall.push(item)
        } else {
          if (currSignatureSplit[0] !== oldSignatureSplit[0]) {
            // the source code changed, inject
            RequiresPackageInjection.push(item)
          }
        }
      } else {
        // old signature not in tree, install
        RequiresPackageManagerInstall.push(item)
      }

      // path does not exist, e.g. not inside `.zen` or `node_modules`, inject
      if (item.import) {
        if (
          !fs.existsSync(path.join(zenRootDirectory, toZenDirectoryImportPackageName(item.name, item.version_resolve)))
        ) {
          RequiresPackageInjection.push(item)
        }
      } else {
        if (!fs.existsSync(path.join(cwd, 'node_modules', item.name))) {
          RequiresPackageInjection.push(item)
        }
      }

      LOCK_FILE_DATA.tree[item.was_traversed] = item.pack_signature
    }
  })

  function FilterRequireDuplicates(Target: zen_package_tree) {
    const t = [...Target]
    const _requiresInjection = t.map(({name}) => name)
    return (Target = t.filter(({name}, index) => !_requiresInjection.includes(name, index + 1)))
  }

  //remove duplications.
  RequiresPackageInjection = FilterRequireDuplicates(RequiresPackageInjection)
  RequiresPackageManagerInstall = FilterRequireDuplicates(RequiresPackageManagerInstall)

  //Anything that requires install, remove if from requires injection.
  RequiresPackageInjection = RequiresPackageInjection.filter((x) => {
    return RequiresPackageManagerInstall.findIndex((tx) => tx.name === x.name && tx.name === x.name) === -1
  })

  const ZEN_DIRECTORY_COMMIT_MESSAGE: string[] = []
  // removing any unwanted packages that are in the `.zen` directory
  if (fs.existsSync(zenRootDirectory)) {
    const dir = fs.readdirSync(zenRootDirectory)
    let i = dir.length
    dir.forEach((f) => {
      // since multiple of the same package can be within the tree, we need to only find a single representation of the package that has "import"
      // to true, if none exists we can safely remove from the directory since no import/traverse_import depends on it in in the `.zen`/import directory.
      let isInTree: boolean | undefined
      if (f.match(/^@/)) {
        // Orginization, so if: @zen/test1, we need to search for test1 within the @zen scope under the .zen directory to check if it is in tree.
        const dir = fs.readdirSync(path.join(zenRootDirectory, f))
        let _i = dir.length
        for (const x of dir) {
          const n = path.join(f, x).replace(/\\/g, '/')
          const find = Tree.find((x) => {
            return toZenDirectoryImportPackageName(x.name, x.version_resolve) === n && x.import === true
          })
            ? true
            : false
          if (find) {
            continue
          }
          fs.rmSync(path.join(zenRootDirectory, f, x), {force: true, recursive: true})
          _i--
          if (dir.length === 1) {
            // if the removing item was the last item, remove the empty dir
            fs.rmSync(path.join(zenRootDirectory, f), {force: true, recursive: true})
          }
        }
        isInTree = _i !== 0
        if (_i === 0) {
          i--
        }
      } else {
        isInTree = Tree.find(
          (x) => toZenDirectoryImportPackageName(x.name, x.version_resolve) === f && x.import === true,
        )
          ? true
          : false
      }
      if (isInTree === undefined) {
        fs.rmSync(path.join(zenRootDirectory, f), {force: true, recursive: true})
        ZEN_DIRECTORY_COMMIT_MESSAGE.push(`Removed ${f}`)
        i--
      }
    })
    if (i === 0) {
      fs.rmSync(zenRootDirectory, {force: true, recursive: true})
    }
  }

  // Here is where we control creating imports, removing imports, and returning what needs to be added to the package.json
  // we also remove what doesn't need to be in the package.json file here aswell (only for package dependencies not zen dependencies as that is done before this call with remove command)
  // but we never write to the package.json file.

  ;[...RequiresPackageInjection, ...RequiresPackageManagerInstall].forEach((target) => {
    // updating the `.zen` directory with all imported packages.
    if (target.import) {
      const ImportPackageName = toZenDirectoryImportPackageName(target.name, target.version_resolve)
      const resolvedImportPath = path.join(zenRootDirectory, ImportPackageName)
      if (!fs.existsSync(resolvedImportPath)) {
        ZEN_DIRECTORY_COMMIT_MESSAGE.push(`Added ${ImportPackageName}.`)
      } else {
        ZEN_DIRECTORY_COMMIT_MESSAGE.push(`Updated ${ImportPackageName}.`)
      }
      // adding to .zen directory
      fs.mkdirSync(resolvedImportPath, {recursive: true})
      fs.cpSync(target.publish_resolve, resolvedImportPath, {force: true, recursive: true})

      if (target.traverse_imports || target.was_traversed) {
        // Update the items package.json to reflect its cwd, since it's now in the `.zen` folder, we have to update each zen import dep to use `../` instead of `./`
        const lockFilePathAtResolvedImport = path.join(resolvedImportPath, ZENLOCKFILENAME)
        if (!fs.existsSync(lockFilePathAtResolvedImport)) {
          return
        }
        const lock = JSON.parse(fs.readFileSync(lockFilePathAtResolvedImport, 'utf-8')) as ZenLockFile
        const _pkgjson = ReadExistingPackageJSON({cwd: resolvedImportPath})
        const localPackagePrefixText = `file:` // the prefix that will be placed at the start of the local path
        let didUpdatePackageJSON = false
        const _handletraversedDepImportsUpdate = (
          items: NonNullable<package_json_read_file['.zen']>['dependencies'],
          scope: 'dependencies',
        ) => {
          if (!items) {
            return
          }
          for (const v in items) {
            const inLock = lock.pkgs[v]
            const scopeInJson = _pkgjson[scope]
            if (!scopeInJson) {
              console.warn(
                `The scope "${scope}" was not found within the package.json file, We could not update the traversed import of "${v}" for "${target.name}@${target.version_resolve}".`,
              )
              return
            }
            if (!inLock) {
              console.warn(
                `While traversing package "${v}", We could not find the package inside it's lock file, This package may have this item specified inside its package.json but has not added it.`,
              )
              continue
            }

            const updatedPath =
              localPackagePrefixText +
              path.join(
                path.relative(resolvedImportPath, zenRootDirectory),
                toZenDirectoryImportPackageName(v, inLock.version_resolve),
              )
            scopeInJson[v] = updatedPath
            didUpdatePackageJSON = true
          }
        }
        _handletraversedDepImportsUpdate(_pkgjson['.zen']?.dependencies, 'dependencies')
        if (didUpdatePackageJSON) {
          WriteExistingPackageJSON({ReadJSON: _pkgjson, cwd: resolvedImportPath})
        }
      }
    }
  })

  if (ZEN_DIRECTORY_COMMIT_MESSAGE.length > 0) {
    AddAndCommitToGit([zenRootDirectory], ZEN_DIRECTORY_COMMIT_MESSAGE.join('\n'), packageJSON)
  }

  const GlobalStore = LoadZenGlobalStoreFile()
  const LOCK_FILE_COMMIT_MESSAGE: string[] = []
  if (RequiresPackageManagerInstall.length > 0) {
    RequiresPackageManagerInstall.forEach((item) => {
      if (item.was_traversed) {
        return // do not add packages that were traversed.
      }
      // PackageManager installation happens mostly on the first every install or whenever the package.json changes
      // so we can update the global installations path here for each of those packages to include the cwd.
      const GloballyPublished = GlobalStore.store[ParseToPublishableName(item.name, item.version_resolve)]
      if (GloballyPublished) {
        if (GloballyPublished.installations.findIndex((x) => x.path === cwd) === -1) {
          GloballyPublished.installations.push({path: cwd})
        }
      } else {
        console.warn(
          chalk.yellow(
            `Failed to add installation path to ${item.name}@${item.version_resolve} because it doesn't seem to be published. this should not happen`,
          ),
        )
      }
    })
    const _names = RequiresPackageManagerInstall.map((x) => x.name + '@' + x.version_resolve).join(', ')
    console.log(chalk.gray(`Run yarn|npm|pnpm to install ${_names}`))
    LOCK_FILE_COMMIT_MESSAGE.push(`Added: ${_names}`)
  }
  if (RequiresPackageInjection.length > 0) {
    RequiresPackageInjection.forEach((target) => {
      if (target.import) {
        return // imports are handled above ^^^^^
      }
      const resolvedNodeModulesPath = path.join(cwd, 'node_modules', target.name)
      fs.mkdirSync(resolvedNodeModulesPath, {
        recursive: true,
      })
      fs.cpSync(target.publish_resolve, resolvedNodeModulesPath, {force: true, recursive: true})
    })
    const _names = RequiresPackageInjection.map((x) => x.name + '@' + x.version_resolve).join(', ')
    console.log(chalk.gray(`Injecting: ${_names}`))
    LOCK_FILE_COMMIT_MESSAGE.push(`Injected: ${_names}`)
  }
  if (removedItems.length > 0) {
    removedItems.forEach((item) => {
      // remove from the package.json dependencies.
      delete packageJSON?.dependencies?.[item.name]
      delete packageJSON?.devDependencies?.[item.name]
      delete packageJSON?.optionalDependencies?.[item.name]
      delete packageJSON?.peerDependencies?.[item.name]

      // remove from global store installation
      const GloballyPublished = GlobalStore.store[ParseToPublishableName(item.name, item.version_resolve)]
      if (GloballyPublished) {
        GloballyPublished.installations = GloballyPublished.installations.filter((x) => x.path !== cwd)
      } else {
        console.warn(
          chalk.yellow(
            `It seems like ${item.name}@${item.version_resolve} does not exist in the global store file so we couldn't remove the installation.`,
          ),
        )
      }
    })
    const _names = removedItems.map((x) => x.name + '@' + x.version_resolve).join(', ')
    console.log(chalk.gray(`Run yarn|npm|pnpm to uninstall ${_names}`))
    LOCK_FILE_COMMIT_MESSAGE.push(`Removed: ${_names}`)
  }

  fs.writeFileSync(LOCKFILEPATH, JSON.stringify(LOCK_FILE_DATA, undefined))
  if (LOCK_FILE_COMMIT_MESSAGE.length > 0) {
    AddAndCommitToGit([LOCKFILEPATH], LOCK_FILE_COMMIT_MESSAGE.join('\n'), packageJSON)
  }

  SaveZenGlobalStoreFile(GlobalStore)

  if (
    RequiresPackageManagerInstall.length === 0 &&
    RequiresPackageInjection.length === 0 &&
    removedItems.length === 0
  ) {
    console.log('Up to date.')
    return [[], removedItems]
  } else {
    return [treeResults, removedItems]
  }
}
