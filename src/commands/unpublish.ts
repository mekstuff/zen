import {ListrEnquirerPromptAdapter} from '@listr2/prompt-adapter-enquirer'
import {Command} from '@oclif/core'
import {Listr} from 'listr2'
import Pluralize from 'pluralize'

import {FromPublishableNameToPublishablePath, ParseToPublishableName} from '../utils/parsers'
import {ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'
import {LoadZenGlobalStoreFile, SaveZenGlobalStoreFile} from '../utils/zen-files'

import chalk = require('chalk')
import fs = require('fs')

type UnpublishContext = {
  packageJSON: package_json_read_file
}

export default class Unpublish extends Command {
  static description = 'Unpublish a package'

  public async run(): Promise<void> {
    await new Listr<UnpublishContext>([
      // Setup
      {
        task: (ctx) => {
          ctx.packageJSON = ReadExistingPackageJSON({requires_fields: ['name', 'version']})
        },
      },
      //
      {
        task: async (ctx, task) => {
          const GlobalStore = LoadZenGlobalStoreFile()
          const PublishableName = ParseToPublishableName(ctx.packageJSON.name, ctx.packageJSON.version)
          const InGlobalStore = GlobalStore.store[PublishableName]
          if (!InGlobalStore) {
            throw `${PublishableName} was not found in global strore.`
          }
          if (InGlobalStore.installations.length > 0) {
            const res = await task.prompt(ListrEnquirerPromptAdapter).run<'ls' | 'n' | 'y'>({
              choices: [
                {message: 'List Directories', name: 'ls'},
                {message: 'No', name: 'n'},
                {message: 'Yes', name: 'y'},
              ],
              message: `${PublishableName} is installed in (${InGlobalStore.installations.length}) ${Pluralize(
                'directory',
                InGlobalStore.installations.length,
              )}, Are you sure you want to unpublish it?`,
              type: 'Select',
            })
            if (res === 'n') {
              throw 'Package not unpublished.'
            }
            if (res === 'ls') {
              task.output = InGlobalStore.installations.map((x) => x.path).join('\n')
              return task.run(ctx)
            }
          }
          delete GlobalStore.store[PublishableName]
          const in_ver_tree = GlobalStore.version_tree[ctx.packageJSON.name]
          if (in_ver_tree) {
            in_ver_tree.splice(in_ver_tree.indexOf(ctx.packageJSON.version), 1)
            if (in_ver_tree.length <= 0) {
              delete GlobalStore.version_tree[ctx.packageJSON.name]
            }
          }
          SaveZenGlobalStoreFile(GlobalStore)
          const p = FromPublishableNameToPublishablePath(
            ParseToPublishableName(ctx.packageJSON.name, ctx.packageJSON.version),
          )
          try {
            fs.rmSync(p, {force: true, recursive: true})
          } catch (err) {
            console.warn(
              chalk.yellow(
                `We failed to fully unpublish ${PublishableName}, The path "${p}" could not be removed because: ${err}\n\nYou must remove it manually.`,
              ),
            )
          }
        },
      },
    ])
      .run()
      .catch((err) => this.error(err))
  }
}
