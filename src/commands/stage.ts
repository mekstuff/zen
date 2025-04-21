import {Args, Command, Flags} from '@oclif/core'
import path from 'path'

import {AddAndCommitToGit} from '../utils/git'
import {ReadExistingPackageJSON, WriteExistingPackageJSON} from '../utils/zen-core'
import {ReadZenLockFile} from '../utils/zen-lock'
import {RunAddListr_InstallListrAsync} from './add'

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
  }

  public async run(): Promise<void> {
    try {
      const {args, flags} = await this.parse(Stage)

      const stage = args.stage

      const lockJSON = ReadZenLockFile()
      const pkgJSON = ReadExistingPackageJSON({
        requires_fields: ['name', 'version', '.zen'],
      })

      const DependencyScopes = [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies',
      ] as Exclude<keyof NonNullable<(typeof pkgJSON)['.zen']>, 'git'>[]

      if (!pkgJSON['.zen']) {
        return
      }

      const isProductionStage = stage === 'production' || stage === 'prod' ? true : false
      if (isProductionStage) {
        this.log('Staging for Production 📦')

        const _converted: string[] = []
        DependencyScopes.forEach((DepScope) => {
          const depScopeContent = pkgJSON['.zen']![DepScope]
          if (depScopeContent === undefined) {
            return
          }
          if (pkgJSON[DepScope] === undefined) {
            this.warn(
              `"${DepScope}" was specified within package.json -> .zen but not found within your root package.json`,
            )
            return
          }
          for (const pkgName in depScopeContent) {
            const pkgInfo = depScopeContent[pkgName]
            let targetVersion: string
            if (flags.exact_version) {
              targetVersion = lockJSON.pkgs[pkgName]!.version_resolve
            } else {
              targetVersion = pkgInfo.version
            }
            if (!targetVersion) {
              this.error(`Could not resolve version for "${pkgName}"`)
            }
            if (pkgJSON[DepScope]![pkgName] === targetVersion) {
              continue
            }
            _converted.push(`${DepScope}.${pkgName} -> ${targetVersion}`)
            pkgJSON[DepScope]![pkgName] = targetVersion
          }
        })

        if (_converted.length > 0) {
          this.log(_converted.join(', '))
          WriteExistingPackageJSON({
            ReadJSON: pkgJSON,
          })
          AddAndCommitToGit([path.join(process.cwd(), 'package.json')], `Staged for production`, pkgJSON)
        }

        this.log('Package is Production ready ✅')
      } else {
        this.log('Staging for Development 📦')
        RunAddListr_InstallListrAsync({
          force_update: true,
          packageJSON: pkgJSON,
        })
        this.log('Package is Development ready 🛠️')
      }
    } catch (err) {
      this.error(err as Error)
    }
  }
}
