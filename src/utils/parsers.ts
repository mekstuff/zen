import path from 'path'

import {LoadZenHomeDirPackages} from './zen-files'

/**
 * @param Name The name of the package.
 * @param Version The version of the package.
 * @returns The Name combined with the Version seperated by the `@` symbol.
 */
export function ParseToPublishableName(Name: string, Version: string): string {
  const Parsed = ParsePackageString(`${Name}@${Version}`) // so we remove any semver symbols on the version
  return `${Parsed.fullName}@${Parsed.version}`
}

/**
 * Gets the path of a publishable package inside the `ZenHomeDirPackages` path.
 *
 * @param ParseToPublishableName The results from the `ParseToPublishableName` function
 * @returns string
 */
export function FromPublishableNameToPublishablePath(ParseToPublishableName: string): string {
  const parsedPublishName = ParsePackageString(ParseToPublishableName)
  // We publish packages so that each version has is a subfolder.
  // So instead of "test@1.2.3" being published it will be "test/1.2.3"
  return path.join(LoadZenHomeDirPackages(), path.join(parsedPublishName.fullName, parsedPublishName.version!))
}

type ParsedPackageString = {
  /**
   * Full name is the [orginization]/[package] or [package] if no orginization exists.
   */
  fullName: string
  orginization: string | undefined
  package: string
  semverSymbol: string | undefined
  version: string | undefined
  versionWithsemverSymbol: string | undefined
}
const ParsedPackageStringCache = new Map<string, ParsedPackageString>()
const SemVersionSymbols = ['*', '^', '~']
/**
 * Parses a package string like @org/abc@1.3.9 -> {
 *  orginization: "org"
 *  package: "abc"
 *  version: "1.3.9"
 * ...
 * }
 * @param PackageString the package string - @org/abc@1.3.9
 * @returns Returns the Parsed package string
 */
export function ParsePackageString(PackageString: string): ParsedPackageString {
  if (ParsedPackageStringCache.has(PackageString)) {
    return ParsedPackageStringCache.get(PackageString)!
  }
  const s = PackageString.split('/')
  let PackageName = s[1] ? s[1] : s[0]
  const OrginizationName = s[1] ? s[0] : undefined
  const VersionSplit = PackageName.split('@')
  let PackageVersion: string | undefined = undefined
  if (VersionSplit.length > 1) {
    PackageVersion = VersionSplit[1]
    PackageName = VersionSplit[0]
  }

  let SemVersionSymbol
  if (PackageVersion) {
    const fVersionChar = PackageVersion.match(/[^s;]/)
    if (fVersionChar) {
      const x = fVersionChar[0]
      const inx = SemVersionSymbols.indexOf(x)
      if (inx !== -1) {
        SemVersionSymbol = SemVersionSymbols[inx]
        PackageVersion = PackageVersion.slice(1)
      }
    }
  }
  const fullName = OrginizationName !== undefined ? OrginizationName + '/' + PackageName : PackageName
  const res: ParsedPackageString = {
    fullName: fullName,
    orginization: OrginizationName,
    package: PackageName,
    semverSymbol: SemVersionSymbol,
    version: PackageVersion,
    versionWithsemverSymbol:
      (PackageVersion && SemVersionSymbol && SemVersionSymbol + PackageVersion) ||
      (PackageVersion && '^' + PackageVersion) ||
      undefined,
  }
  ParsedPackageStringCache.set(PackageString, res)
  return res
}
