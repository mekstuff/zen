import {Args, Command} from '@oclif/core'
import {Listr} from 'listr2'

import {ParsePackageString} from '../utils/parsers'
import {ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'
import {AddListr_InstallListr} from './add'

type RemoveContext = {
  packageJSON: package_json_read_file
}

/**
 * @param ReadExistingPackageJSONAndAddToContext Sometimes the context may already contain a package.json so there's no need to read it again,
 * However if that's not the case, set this to true so that the package json is read and added to ctx.
 *
 * @returns Listr object with RemoveContext
 */
export function RemoveListr_UninstallListr(ReadExistingPackageJSONAndAddToContext?: boolean) {
  return new Listr<RemoveContext>([
    {
      skip: !ReadExistingPackageJSONAndAddToContext,
      task: (ctx) => {
        ctx.packageJSON = ReadExistingPackageJSON()
      },
    },
    {
      task: (ctx) => {
        if (!ctx.packageJSON) {
          throw 'Missing PackageJSON from context'
        }
      },
    },
  ])
}

export function RemoveListr(packages: string[]) {
  return new Listr<RemoveContext>([
    // Setup
    {
      task: (ctx) => {
        ctx.packageJSON = ReadExistingPackageJSON()
      },
    },
    {
      task: (ctx, task) => {
        packages.forEach((Package) => {
          const _p = ParsePackageString(Package)
          delete ctx.packageJSON['.zen']?.dependencies?.[_p.fullName]
          delete ctx.packageJSON['.zen']?.devDependencies?.[_p.fullName]
          delete ctx.packageJSON['.zen']?.optionalDependencies?.[_p.fullName]
          delete ctx.packageJSON['.zen']?.peerDependencies?.[_p.fullName]

          delete ctx.packageJSON?.dependencies?.[_p.fullName]
          delete ctx.packageJSON?.devDependencies?.[_p.fullName]
          delete ctx.packageJSON?.optionalDependencies?.[_p.fullName]
          delete ctx.packageJSON?.peerDependencies?.[_p.fullName]
        })
        task.title = 'Packages removed'
      },
      title: `Removing packages`,
    },
    {
      // we removed packages from the "virtual" package json, then we run addlistr_installlistr to save that new package.json
      // and it will handle removing unused packages (the ones we just removed)
      task: () => AddListr_InstallListr(),
      title: 'Linking dependencies',
    },
  ])
}

export default class Remove extends Command {
  static args = {
    packages: Args.string({description: 'Packages to remove', multiple: true, required: true}),
  }
  static description = 'describe the command here'
  static strict = false

  public async run(): Promise<void> {
    const {argv} = await this.parse(Remove)
    await RemoveListr(argv as string[])
      .run()
      .catch((err) => this.error(err))
  }
}
