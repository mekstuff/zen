import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import path from 'path'

import {AddAndCommitToGit} from '../utils/git'
import {ReadExistingPackageJSON, WriteExistingPackageJSON} from '../utils/zen-core'
import {ReadZenLockFile} from '../utils/zen-lock'
import {RunAddListr_InstallListrAsync} from './add'

type StageCommandStagingMode = 'dev' | 'development' | 'prod' | 'production'

/**
 * The main function for AddListr_InstallListr/"pulling"
 * @param ctx The context containing packageJSON.
 * @returns void
 */
export const RunStageListr_Stage = async (ctx: {
  exact_version?: boolean
  ignore_workspacePathResolves?: boolean
  stage: StageCommandStagingMode
}) => {
  try {
    const stage = ctx.stage

    const lockJSON = ReadZenLockFile()
    const pkgJSON = ReadExistingPackageJSON({
      requires_fields: ['name', 'version', '.zen'],
    })

    const DependencyScopes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as Exclude<
      keyof NonNullable<(typeof pkgJSON)['.zen']>,
      'git'
    >[]

    if (!pkgJSON['.zen']) {
      return
    }

    const isProductionStage = stage === 'production' || stage === 'prod' ? true : false
    if (isProductionStage) {
      console.log('Staging for Production 📦')

      const _converted: string[] = []
      DependencyScopes.forEach((DepScope) => {
        const depScopeContent = pkgJSON['.zen']![DepScope]
        if (depScopeContent === undefined) {
          return
        }
        if (pkgJSON[DepScope] === undefined) {
          console.warn(
            `"${DepScope}" was specified within package.json -> .zen but not found within your root package.json`,
          )
          return
        }
        for (const pkgName in depScopeContent) {
          const pkgInfo = depScopeContent[pkgName]
          let targetVersion: string
          if (ctx.exact_version) {
            targetVersion = lockJSON.pkgs[pkgName]!.version_resolve
          } else {
            targetVersion = pkgInfo.version
          }
          if (!targetVersion) {
            console.error(`Could not resolve version for "${pkgName}"`)
          }
          if (pkgJSON[DepScope]![pkgName] === targetVersion) {
            continue
          }
          _converted.push(`${DepScope}.${pkgName} -> ${targetVersion}`)
          pkgJSON[DepScope]![pkgName] = targetVersion
        }
      })

      if (_converted.length > 0) {
        console.log(_converted.join(', '))
        WriteExistingPackageJSON({
          ReadJSON: pkgJSON,
        })
        AddAndCommitToGit([path.join(process.cwd(), 'package.json')], `Staged for production`, pkgJSON)
      }

      console.log('Package is Production ready ✅')
    } else {
      console.log(
        `Staging for Development 📦${ctx.ignore_workspacePathResolves ? `${chalk.gray(' (Ignoring Workspace)')}` : ''}`,
      )
      RunAddListr_InstallListrAsync({
        force_update: true,
        ignore_workspacePathResolves: ctx.ignore_workspacePathResolves,
        packageJSON: pkgJSON,
      })
      console.log(`Package is Development ready 🛠️`)
    }
  } catch (err) {
    console.error(err as Error)
  }
}

export default class Stage extends Command {
  static args = {
    stage: Args.string({
      description:
        'The current "stage", production | development. In production mode, all zen packages in your package.json will be converted to using their listed version aka your production ready counterparts.\n\ne.g. "@mekstuff/package: file:path/to/file" will become "@mekstuff/package: x.x.x"\n\nExpected to be used in your "prePublishOnly" and "postpublish" script lifecycle.',
      options: ['production', 'development', 'prod', 'dev'],
      required: true,
    }),
  }

  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    exact_version: Flags.boolean({
      aliases: ['exact'],
      description:
        "Swap to the exact currently installed version. e.g. ^1.5.6 will be converted to 1.5.6 once it's the version installed.",
    }),
    publishing: Flags.boolean({
      description:
        "When staging for development, you can provide this flag so if a workspace zen package is defined, it will resolve to the normal path instead of 'workspace:*', this is useful when publish to the zen store while the package is used in a workspace for development.",
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Stage)
    const stage = args.stage as StageCommandStagingMode
    return RunStageListr_Stage({
      exact_version: flags.exact_version,
      ignore_workspacePathResolves: flags.publishing,
      stage: stage,
    })
  }
}
