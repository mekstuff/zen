import {Command} from '@oclif/core'
import fs from 'fs'
import {Listr} from 'listr2'
import path from 'path'

import {ParseToPublishableName} from '../utils/parsers'
import {ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'
import {LoadZenGlobalStoreFile} from '../utils/zen-files'
import {RunAddListr_InstallListrAsync} from './add'

type PushContext = {
  packageJSON: package_json_read_file
}
/**
 * returns the `Listr` object that handles pushing.
 *
 * @param cwd The current working directory.
 *
 * @returns ListrObject
 */
export function PushListr() {
  return new Listr<PushContext>([
    {
      task: (ctx) => {
        ctx.packageJSON = ReadExistingPackageJSON()
      },
    },
    {
      task: async (ctx) => {
        const GlobalStore = LoadZenGlobalStoreFile()
        const InstallationPathTree: {json: package_json_read_file; path: string}[] = []
        const AddPackageInstallationsToTree = (PackageName: string, PackageVersion: string, root?: boolean) => {
          const PublishableName = ParseToPublishableName(PackageName, PackageVersion)
          const InGlobalStore = GlobalStore.store[PublishableName]
          if (!InGlobalStore) {
            if (root) {
              throw `${PublishableName} was not found in global strore.`
            }
            return
          }
          InGlobalStore.installations.forEach(async (installation) => {
            if (InstallationPathTree.findIndex((x) => x.path === installation.path) !== -1) {
              return
            }
            const PackageJSONPath = path.join(installation.path, 'package.json')
            if (fs.existsSync(PackageJSONPath)) {
              const pj = JSON.parse(fs.readFileSync(PackageJSONPath, 'utf-8')) as package_json_read_file
              InstallationPathTree.push({json: pj, path: installation.path})
              if (pj.name && pj.version) {
                AddPackageInstallationsToTree(pj.name, pj.version)
              }
            }
          })
        }
        AddPackageInstallationsToTree(ctx.packageJSON.name, ctx.packageJSON.version, true)
        const original_dir = process.cwd()
        InstallationPathTree.forEach(async (installation) => {
          process.chdir(installation.path)
          console.log(`(${installation.path}):`)
          await RunAddListr_InstallListrAsync({
            packageJSON: installation.json,
          })
        })
        process.chdir(original_dir)
      },
    },
  ])
}

export default class Push extends Command {
  static description = 'Pushes the latest published version of the package to all installations.'

  public async run(): Promise<void> {
    await PushListr().run()
  }
}
