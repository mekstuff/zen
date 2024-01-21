import {FromPublishableNameToPublishablePath, ParseToPublishableName} from './parsers'

import fs = require('fs')
import os = require('os')
import path = require('path')
import semver = require('semver')

export const ZENLOCKFILENAME = 'zen.lock.json'
export const ZENLOCKVERSION = '0'

export type ZenLockFile = {
  pkgs: Record<
    string,
    {
      import?: boolean
      signature: string
      traverse_imports?: boolean
      version: string
      version_resolve: string
    }
  >
  tree: Record<string, string>
  version: string
}

type PublishedGlobalStorePackage_Installation = {
  path: string
}
/**
 * Type of a stored package.
 */
type PublishedGlobalStorePackage = {
  installations: PublishedGlobalStorePackage_Installation[]
  pack_signature: string
  resolve: string
}

const GLOBAL_STORE_NAME = 'global.store.json'

/**
 * Creates the `~/.zen` directory if it doesn't exist.
 *
 * @returns The path of the `~/.zen` directory
 */
export function LoadZenHomeDir(): string {
  const Directory = path.join(os.homedir(), '.zen-cli')
  try {
    if (!fs.existsSync(Directory)) {
      fs.mkdirSync(Directory, {recursive: true})
    }
  } catch (err) {
    throw 'An error occurred when attempting to load .zen-cli home directory'
  }
  return Directory
}

/**
 * Creates the `~/.zen/packages` directory if it doesn't exist.
 *
 * @returns The path of the `~/.zen/packages` directory
 */
export function LoadZenHomeDirPackages(): string {
  const PackagesDir = path.join(LoadZenHomeDir(), 'packages')
  try {
    if (!fs.existsSync(PackagesDir)) {
      fs.mkdirSync(PackagesDir, {recursive: true})
    }
  } catch (err) {
    throw `An error occurred when attempting to load .zen-cli packages directory. ${err}`
  }
  return PackagesDir
}

/**
 * type of what the `~/.zen/[GLOBAL_STORE_NAME]` contains.
 */
type ZenGlobalStoreFile = {
  store: Record<string, PublishedGlobalStorePackage>
  /**
   * Stores the versions of packages in a record.
   *
   * @example
   * version_tree = {
   * package: [
   *  "0.0.1"
   * ]
   * }
   */
  version_tree: Record<string, string[]>
}
/**
 * Creates a "Global Store" json file containing all published packages. if it didn't exist in `~/.zen/[GLOBAL_STORE_NAME]`
 *
 * @returns {ZenGlobalStoreFile} The read ZenGlobalStore File
 */
export function LoadZenGlobalStoreFile(): ZenGlobalStoreFile {
  const fileDir = path.join(LoadZenHomeDir(), GLOBAL_STORE_NAME)
  try {
    if (!fs.existsSync(fileDir)) {
      const _v: ZenGlobalStoreFile = {
        store: {},
        version_tree: {},
      }
      fs.writeFileSync(fileDir, JSON.stringify(_v, undefined, 2))
      return _v
    }
  } catch (err) {
    throw `An error occurred when attempting to load .zen-cli ${GLOBAL_STORE_NAME} file. ${err}`
  }
  return JSON.parse(fs.readFileSync(fileDir, 'utf-8')) as ZenGlobalStoreFile
}

/**
 * Saves the data to the ZenGlobalStore File
 *
 *
 * @param Data The current data to save
 * @returns void
 */
export function SaveZenGlobalStoreFile(Data: ZenGlobalStoreFile) {
  const fileDir = path.join(LoadZenHomeDir(), GLOBAL_STORE_NAME)
  try {
    fs.writeFileSync(fileDir, JSON.stringify(Data, undefined))
  } catch (err) {
    throw `An error occurred when attempting to load .zen-cli ${GLOBAL_STORE_NAME} file. ${err}`
  }
}

/**
 * Adds the package to the GlobalStore.
 *
 * @param packageData Data that will be published to the `Global Store File`
 * @returns void
 */
export function AddPublishedPackageToGlobalStoreFile(packageData: {
  name: string
  pack_signature: string
  version: string
}) {
  const GlobalStore = LoadZenGlobalStoreFile()
  const inVerTree = GlobalStore.version_tree[packageData.name]
  if (!inVerTree) {
    GlobalStore.version_tree[packageData.name] = [packageData.version]
  } else {
    if (GlobalStore.version_tree[packageData.name].indexOf(packageData.version) === -1) {
      GlobalStore.version_tree[packageData.name].push(packageData.version)
    }
  }
  const publishName = ParseToPublishableName(packageData.name, packageData.version)
  const PreviouslyPublishedData = GlobalStore.store[publishName]
  const publishResolvePath = FromPublishableNameToPublishablePath(publishName)
  if (PreviouslyPublishedData) {
    // preserve previous data and only update what's needed.
    PreviouslyPublishedData.pack_signature = packageData.pack_signature
    PreviouslyPublishedData.resolve = publishResolvePath
    // remove any invalid installation paths
    PreviouslyPublishedData.installations = PreviouslyPublishedData.installations
      .filter((x) => {
        if (fs.existsSync(x.path)) {
          return x
        }
      })
      .filter(Boolean)
  } else
    [
      (GlobalStore.store[publishName] = {
        installations: [],
        pack_signature: packageData.pack_signature,
        resolve: publishResolvePath,
      }),
    ]
  // Save
  SaveZenGlobalStoreFile(GlobalStore)
}

/**
 * Gets the published package data from the global store file, if it doesn't exist an error will be thrown
 *
 * @param Name The name of the target package.
 * @param Version The version of the target package.
 * @param SupportsemverVersion Will support versions such as "*" or "^0.4" and get the relative package.
 * @returns {[PublishedGlobalStorePackage, string]} The published package data and the parsed publishable name
 */
export function GetPublishedPackageFromGlobalStoreFile(
  Name: string,
  Version: string,
  SupportsemverVersion?: boolean,
): [PublishedGlobalStorePackage, string] {
  const GlobalStore = LoadZenGlobalStoreFile()
  let publishName = ParseToPublishableName(Name, Version)
  let Package = GlobalStore.store[publishName]
  if (!Package && SupportsemverVersion) {
    const compatVersions = GetCompatiableVersionsOfPackageFromGlobalStoreFile(Name, Version)
    if (compatVersions.length <= 0) {
      throw `No compataible versions matched "${Version}" for "${publishName}"`
    }
    // update Package to be this new compatiable version
    publishName = ParseToPublishableName(Name, compatVersions[0])
    Package = GlobalStore.store[publishName]
  }
  if (!Package) {
    throw `${publishName}@${Version} was not found in global store.`
  }
  return [Package, publishName]
}

/**
 * Gets the versions of the package inside the `version_tree` of the global store file.
 *
 * throws an error if not found in `version_tree`
 *
 * @param Name Name of the package (including orginization).
 * @returns Array
 */
function GetVersionsOfPackageFromGlobalStoreFile(Name: string): string[] {
  const GlobalStore = LoadZenGlobalStoreFile()
  const InVersionTree = GlobalStore.version_tree[Name]
  if (!InVersionTree) {
    throw `${Name} was not found inside the version_tree.`
  }
  return InVersionTree
}
/**
 * Gets the compatiable versions of the package relative to the `CurrentVersion`. If no `CurrentVersion` is specified then it will
 * return the latest version only (if found).
 *
 * throws an error if not found in `version_tree`
 *
 * @param Name Name of the package (including orginization).
 * @param CurrentVersion The current version to get compatiable versions for. uses `semver`
 * @returns Array Sorted from latest to oldest.
 */
export function GetCompatiableVersionsOfPackageFromGlobalStoreFile(Name: string, CurrentVersion?: string): string[] {
  const Versions = GetVersionsOfPackageFromGlobalStoreFile(Name)
  if (!CurrentVersion) {
    const latest = semver.maxSatisfying(Versions, CurrentVersion ?? '*')
    if (latest !== null) {
      return [latest]
    }
    return []
  }
  const compat_versions = Versions.map((x) => {
    if (semver.satisfies(x, CurrentVersion)) {
      return x
    }
  }).filter(Boolean) as string[]
  return semver.rsort(compat_versions)
}
