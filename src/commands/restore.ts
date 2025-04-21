import {Args, Command} from '@oclif/core'
import chalk from 'chalk'
import {execSync} from 'child_process'
import fs from 'fs'
import ora from 'ora'
import path from 'path'
import yesno from 'yesno'

import {GetZenGlobalStoreFilePath, LoadZenGlobalStoreFile, ZenGlobalStoreFile} from '../utils/zen-files'

export default class Restore extends Command {
  static args = {
    file: Args.string({
      default: path.join(process.cwd(), `global.store.backup.json`),
      description: 'Backup restore JSON file.',
      required: true,
    }),
  }

  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {args} = await this.parse(Restore)

    try {
      const JSONFile = JSON.parse(fs.readFileSync(args.file, {encoding: 'utf8'})) as ZenGlobalStoreFile
      if (JSONFile.store === undefined || JSONFile.version_tree === undefined) {
        throw `File ${args.file} is not a valid store file. Missing "store" or "version_tree" fields.`
      }

      const response = await yesno({
        defaultValue: null,
        question: `${chalk.gray(
          `Restoring this global store will attempt to publish its defined packages and override your existing global store, A copy of your current store will be added to your current working directory.\n\nFile: ${args.file}`,
        )}\nProceed?`,
      })

      if (response === false) {
        throw 'User cancelled.'
      }

      const SpinnerPrefixText = chalk.bgRed(
        `Restoring Global Store\n>> Please keep terminal active while we restore your global store! <<`.toUpperCase(),
      )

      const Spinner = ora(SpinnerPrefixText).start()

      const UpdateSpinnerText = (Input: string) => {
        Spinner.text = `${SpinnerPrefixText}\n${chalk.gray(Input)}`
      }

      LoadZenGlobalStoreFile() // ensure file exists.

      UpdateSpinnerText('Copying current store.')
      fs.cpSync(
        GetZenGlobalStoreFilePath(),
        path.join(
          process.cwd(),
          `global.store.restore@${new Date(Date.now())
            .toLocaleString()
            .replaceAll('/', '-')
            .replaceAll(':', '-')}.json`,
        ),
      )

      const OutputConsoleLogs: string[] = []

      for (const PackageName in JSONFile.store) {
        const PackageData = JSONFile.store[PackageName]
        UpdateSpinnerText(`Verifying "${PackageName}"`)
        const BuildExistsLocally = fs.existsSync(PackageData.origin)
        if (BuildExistsLocally === false) {
          OutputConsoleLogs.push(
            chalk.bgGray(`Package: ${PackageName} was not found on your device. ORIGIN PATH: ${PackageData.origin}`),
          )
          continue
        }

        try {
          UpdateSpinnerText(`Publishing ${PackageName}`)
          execSync(`zen publish --no-scripts`, {
            cwd: PackageData.origin,
          })
        } catch (err) {
          OutputConsoleLogs.push(chalk.bgRed(`Failed to publish package ${PackageName}. ERROR: ${err}`))
        }
      }

      Spinner.succeed()
      if (OutputConsoleLogs.length > 0) {
        console.log(OutputConsoleLogs.join('\n'))
      }
    } catch (err) {
      console.log(`${chalk.red('Failed to restore backup file:')} ${chalk.gray(err)}`)
    }
  }
}
