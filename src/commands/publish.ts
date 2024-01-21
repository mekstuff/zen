import {Command, Flags} from '@oclif/core'
import {Listr} from 'listr2'

import {FromPublishableNameToPublishablePath, ParseToPublishableName} from '../utils/parsers'
import {HashPackageJsonFileAsync, ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'
import {AddPublishedPackageToGlobalStoreFile} from '../utils/zen-files'
import {PackListr} from './pack'

import path = require('path')

export default class Publish extends Command {
  static description = 'Publish a package locally.'
  static flags = {
    scripts: Flags.boolean({
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
            return PackListr(
              FromPublishableNameToPublishablePath(
                ParseToPublishableName(ctx.packageJSON.name, ctx.packageJSON.version),
              ),
              flags.scripts,
            )
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
      ],
      {collectErrors: 'full', concurrent: false},
    )
      .run()
      .catch((err) => {
        this.error(err)
      })
  }
}
