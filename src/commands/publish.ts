import {Command, Flags} from '@oclif/core'
import {Listr} from 'listr2'

import {FromPublishableNameToPublishablePath, ParseToPublishableName} from '../utils/parsers'
import {HashPackageJsonFileAsync, ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'
import {AddPublishedPackageToGlobalStoreFile, ZENLOCKFILENAME} from '../utils/zen-files'
import {PackListr} from './pack'

import fs = require('fs')
import path = require('path')
export default class Publish extends Command {
  static description = 'Publishes a package locally.'
  static flags = {
    scripts: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Runs publish lifecycle scripts (no publish related scripts are ran, only pack scripts.)',
    }),
  }
  public async run(): Promise<{pack_signature: string; packageJSON: package_json_read_file}> {
    const {flags} = await this.parse(Publish)
    return await new Listr<{pack_signature: string; packageJSON: package_json_read_file}>(
      [
        // Setup
        {
          task: (ctx) => {
            ctx.packageJSON = ReadExistingPackageJSON({requires_fields: ['name', 'version']})
          },
        },
        // Pack
        {
          task: async (ctx) => {
            const targetPath = FromPublishableNameToPublishablePath(
              ParseToPublishableName(ctx.packageJSON.name, ctx.packageJSON.version),
            )
            return PackListr(targetPath, flags.scripts)
          },
          title: 'Packing',
        },
        // Publish to global store file
        {
          task: async (ctx) => {
            const packageJsonHash = await HashPackageJsonFileAsync(path.join(process.cwd(), 'package.json'))
            ctx.pack_signature = ctx.pack_signature + packageJsonHash.substring(0, packageJsonHash.length / 2)
            AddPublishedPackageToGlobalStoreFile({
              name: ctx.packageJSON.name,
              pack_signature: ctx.pack_signature,
              version: ctx.packageJSON.version,
            })
          },
          title: 'Adding to global store',
        },
        // Copy the `zen.lock` file to the published directory, this is need in cases where we plan
        // to import the packages elsewhere so we can get its dependencies.
        {
          task: (ctx, task) => {
            const lockPath = path.join(process.cwd(), ZENLOCKFILENAME)
            if (!fs.existsSync(lockPath)) {
              task.skip('No zen.lock.json exists.')
              return
            }
            const ResolvedDirectory = FromPublishableNameToPublishablePath(
              ParseToPublishableName(ctx.packageJSON.name, ctx.packageJSON.version),
            )
            try {
              const ZENLOCKFILE_targetDir = path.join(ResolvedDirectory, ZENLOCKFILENAME)
              if (!fs.existsSync(ZENLOCKFILE_targetDir)) {
                fs.cpSync(lockPath, ZENLOCKFILE_targetDir, {recursive: true})
              } else {
                task.skip(`${ZENLOCKFILENAME} file was already included with publish`)
              }
            } catch (err) {
              task.skip(`Something wen't wrong when copying ${ZENLOCKFILENAME}, view output.`)
              console.warn(err)
            }
          },
          title: `Copying ${ZENLOCKFILENAME}`,
        },
      ],
      {collectErrors: 'full', concurrent: false},
    )
      .run()
      .catch((err) => {
        this.error(err)
      })
  }
}
