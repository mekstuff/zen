import {Args, Command, Flags} from '@oclif/core'
import {Listr} from 'listr2'

import {AddAndCommitToGit} from '../utils/git'
import {ParsePackageString, ParseToPublishableName} from '../utils/parsers'
import {
  GenerateZenPackagesTree,
  ReadExistingPackageJSON,
  ResolveZenPackagesTree,
  WriteExistingPackageJSON,
  package_json_read_file,
  zen_package_tree_dependency,
} from '../utils/zen-core'
import {GetCompatiableVersionsOfPackageFromGlobalStoreFile} from '../utils/zen-files'

import path = require('path')

const runScript = require('@npmcli/run-script')

type AddContext = {
  packageJSON: package_json_read_file
  resolved_packages_names: {name: string; resolvedName: string; versionWithsemverSymbol: string}[]
}

/**
 * The main function for AddListr_InstallListr/"pulling"
 * @param ctx The context containing packageJSON.
 * @returns void
 */
export const RunAddListr_InstallListrAsync = async (ctx: {packageJSON: package_json_read_file}) => {
  if (!ctx.packageJSON) {
    throw 'Missing PackageJSON from context'
  }
  const _DEPSCOPES = ['dependencies', 'devDependencies'] as const
  const _PackgesResolvedToScope: Record<string, (typeof _DEPSCOPES)[number]> = {} // kind of weird but we assign each package to the scope here so after we resolve zen package tree we can know what dependecy scope they belong to.
  const PackagesForTree: zen_package_tree_dependency[] = []
  _DEPSCOPES.forEach((depScope) => {
    const zenHas = ctx.packageJSON['.zen']?.[depScope]
    if (zenHas) {
      for (const zenPackageName in zenHas) {
        const zenPackage = zenHas[zenPackageName]
        _PackgesResolvedToScope[zenPackageName] = depScope
        PackagesForTree.push({
          name: zenPackageName,
          ...zenPackage,
        })
      }
    }
  })
  const [resolvedPackages, removedPackages] = ResolveZenPackagesTree(
    GenerateZenPackagesTree(PackagesForTree),
    process.cwd(),
    ctx.packageJSON,
  )
  const resolvedPackagesThatChanged: string[] = []
  const localPackagePrefixText = `file:` // the prefix that will be placed at the start of the local path
  resolvedPackages.forEach((pkg) => {
    const depScope = _PackgesResolvedToScope[pkg.name]
    if (!ctx.packageJSON[depScope]) {
      // if the depscope didn't exist then a change will be made 100%
      resolvedPackagesThatChanged.push(pkg.name)
    } else {
      if (ctx.packageJSON[depScope]![pkg.name] !== localPackagePrefixText + pkg.resolvedPackagePath) {
        // if the path is not the same then the data will change.
        resolvedPackagesThatChanged.push(pkg.name)
      }
    }
    ctx.packageJSON[depScope] = ctx.packageJSON[depScope] || {}
    ctx.packageJSON[depScope]![pkg.name] = localPackagePrefixText + pkg.resolvedPackagePath
  })
  WriteExistingPackageJSON({ReadJSON: ctx.packageJSON})
  if (resolvedPackagesThatChanged.length > 0) {
    if (ctx.packageJSON['.zen']?.git?.packageCommits === true) {
      AddAndCommitToGit(
        [path.join(process.cwd(), 'package.json')],
        `Added ${resolvedPackagesThatChanged.join(',')}`,
        ctx.packageJSON,
      )
    }
    // run the "zen-postadd" script lifecycle only when new packages are added.
    await runScript({
      event: 'zen-postadd',
      path: process.cwd(),
      stdio: 'inherit',
    })
  }
  if (removedPackages.length > 0) {
    // run the "zen-postremove" script lifecycle only when previous packages were removed.
    await runScript({
      event: 'zen-postremove',
      path: process.cwd(),
      stdio: 'inherit',
    })
  }
  if (removedPackages.length > 0 || resolvedPackagesThatChanged.length > 0) {
    // run the "zen-postupdate" script lifecycle only when previous packages were removed or new packages were added.
    await runScript({
      event: 'zen-postupdate',
      path: process.cwd(),
      stdio: 'inherit',
    })
  }
}

/**
 * @param ReadExistingPackageJSONAndAddToContext Sometimes the context may already contain a package.json so there's no need to read it again,
 * However if that's not the case, set this to true so that the package json is read and added to ctx.
 *
 * @returns Listr object with AddContext
 */
export function AddListr_InstallListr(ReadExistingPackageJSONAndAddToContext?: boolean) {
  return new Listr<AddContext>([
    {
      skip: !ReadExistingPackageJSONAndAddToContext,
      task: (ctx) => {
        ctx.packageJSON = ReadExistingPackageJSON()
      },
    },
    {
      task: async (ctx) => {
        await RunAddListr_InstallListrAsync(ctx)
      },
    },
  ])
}

/**
 * returns the `Listr` object that handles packing.
 *
 * @param packages The directory in wihich the "packed" file will be placed.
 * @param options Add options.
 * @returns ListrObject
 */
export function AddListr(
  packages: string[],
  options: {dev?: boolean; import?: boolean; optional?: boolean; peer?: boolean; traverse_imports?: boolean},
) {
  return new Listr<AddContext>([
    // Setup
    {
      task: (ctx) => {
        ctx.packageJSON = ReadExistingPackageJSON()
      },
    },
    // "resolve" package names/versions etc for .zen deps
    {
      task: (ctx, task) => {
        ctx.resolved_packages_names = []
        packages.forEach((Package) => {
          const PackageNameParsed = ParsePackageString(Package)

          // if we use ... add package@latest or ... add package. then get the latest version of that package
          if (PackageNameParsed.version === 'latest' || PackageNameParsed.version === undefined) {
            const compatVersions = GetCompatiableVersionsOfPackageFromGlobalStoreFile(
              PackageNameParsed.fullName,
              //  PackageNameParsed.versionWithsemverSymbol,
              '*',
            )
            if (!compatVersions[0]) {
              throw `No compatiable version for ${PackageNameParsed.fullName} was found! [${PackageNameParsed.versionWithsemverSymbol} || ${PackageNameParsed.version}]`
            }
            const targetPackageName = ParseToPublishableName(PackageNameParsed.fullName, compatVersions[0])
            ctx.resolved_packages_names.push({
              name: PackageNameParsed.fullName,
              resolvedName: targetPackageName,
              versionWithsemverSymbol: (PackageNameParsed.semverSymbol || '^') + compatVersions[0],
            })
          } else {
            // else if we speciify the package version as such: ... add package@3.1.3 or ... add package@~1. then just add that
            // to the zen package.json, AddListr_InstallListr handles the correct package.
            const targetPackageName = ParseToPublishableName(PackageNameParsed.fullName, PackageNameParsed.version)
            ctx.resolved_packages_names.push({
              name: PackageNameParsed.fullName,
              resolvedName: targetPackageName,
              versionWithsemverSymbol: PackageNameParsed.versionWithsemverSymbol || '*',
            })
          }
        })

        task.title = 'Packages resolved'
      },
      title: `Resolving packages`,
    },
    // update zen deps
    {
      task: (ctx, task) => {
        const depScope = options.dev ? 'devDependencies' : 'dependencies'
        ctx.resolved_packages_names.forEach((resolved) => {
          if (options.dev && ctx.packageJSON['.zen']?.dependencies?.[resolved.name]) {
            // if it is a being added as a devDependency and was previously under "dependencies", then remove it from "dependencies"
            delete ctx.packageJSON['.zen'].dependencies[resolved.name]
            delete ctx.packageJSON?.['dependencies']?.[resolved.name]
          }
          if (!options.dev && ctx.packageJSON['.zen']?.devDependencies?.[resolved.name]) {
            // if it is a being added as a dependency and was previously under "devDependencies", then remove it from "devDependencies"
            delete ctx.packageJSON['.zen'].devDependencies[resolved.name]
            delete ctx.packageJSON?.['devDependencies']?.[resolved.name]
          }
          ctx.packageJSON['.zen'] = ctx.packageJSON['.zen'] || {}
          ctx.packageJSON['.zen'][depScope] = ctx.packageJSON['.zen'][depScope] || {}

          /*
          const wasPreviouslyInstalledAsSameDepScope = ctx.packageJSON['.zen'][depScope]![resolved.name]
          // use the old version in package.json if it is compataible, uncompatiable cases will be where old version was ^3.1.4 and a breaking version is now being installed 4.0.0
          // We can keep ^3.1.4 if ^3.1.6 is the change in the package.json since ^3.1.4 will resolve to ^3.1.6 package.
          const versionToUseInPackageJSON =
            (wasPreviouslyInstalledAsSameDepScope && wasPreviouslyInstalledAsSameDepScope.version) ||
            resolved.versionWithsemverSymbol
          */

          ctx.packageJSON['.zen'][depScope]![resolved.name] = {
            import: options.import,
            traverse_imports: options.traverse_imports,
            version: resolved.versionWithsemverSymbol,
          }
        })
        task.title = 'Updated .zen dependencies'
      },
      title: 'Updating .zen dependencies',
    },
    // install ( this will also write the package.json to reflect all changes. )
    {
      task: () => AddListr_InstallListr(),
    },
  ])
}

export default class Add extends Command {
  static args = {
    packages: Args.string({description: 'Packages to add', multiple: true, required: true}),
  }
  static description =
    'Adds zen packages to the directory. Please note than zen never installs with a package manager, You have to manually run your package manager after zen, for automation refer to the script lifecycles of zen.'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    dev: Flags.boolean({char: 'D', default: false, description: 'Add as a devDependency'}),
    import: Flags.boolean({default: false, description: 'Import the package'}),
    optional: Flags.boolean({char: 'O', default: false, description: 'Add as a optionalDependency'}),
    peer: Flags.boolean({char: 'P', default: false, description: 'Add as a peerDependency'}),
    traverse_imports: Flags.boolean({default: false, description: 'Traverse imports'}),
  }
  static strict = false

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Add)
    await AddListr(argv as string[], {
      dev: flags.dev,
      import: flags.import,
      optional: flags.optional,
      peer: flags.peer,
      traverse_imports: flags.traverse_imports,
    })
      .run()
      .catch((err) => this.error(err))
  }
}
