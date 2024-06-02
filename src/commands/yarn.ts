import fs from 'fs'
import {Args, Command, Flags} from '@oclif/core'
import {execSync} from 'child_process'
import path from 'path'

export default class Yarn extends Command {
  static description = 'Runs "yarn install", removes .yarn-integrity so local zen packages are installed correctly.'

  public async run(): Promise<void> {
    const yarnIntegrityPath = path.join(process.cwd(), 'node_modules', '.yarn-integrity')
    if (fs.existsSync(yarnIntegrityPath)) {
      this.log(`Removing yarn integrity`)
      fs.rmSync(yarnIntegrityPath)
    }
    const commandToExecute = 'yarn install'
    this.log(`Running "${commandToExecute}"`)
    try {
      execSync(commandToExecute)
    } catch (err) {
      this.warn(`Failed to execute "${commandToExecute}" successfully. => ${err}`)
    }
  }
}
