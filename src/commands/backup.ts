import {Args, Command} from '@oclif/core'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

import {GetZenGlobalStoreFilePath, LoadZenGlobalStoreFile} from '../utils/zen-files'

export default class Backup extends Command {
  static args = {
    output: Args.string({description: 'file to read'}),
  }

  static description =
    'Creates a copy of the current global store inside your current working directory which you can revert to by using "zen restore <FILE>"'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {args} = await this.parse(Backup)

    LoadZenGlobalStoreFile() // Make sure file exists.
    const ZenGlobalStoreFilePath = GetZenGlobalStoreFilePath()
    const OutputDirectory = args.output ?? path.join(process.cwd(), `global.store.backup.json`)

    console.log(`Created backup file: ${chalk.gray(OutputDirectory)}`)

    fs.cpSync(ZenGlobalStoreFilePath, OutputDirectory)
  }
}
