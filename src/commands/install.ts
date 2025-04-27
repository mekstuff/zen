import {Args, Command} from '@oclif/core'
import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

const preferredPM = require('preferred-pm')

const installers: Record<string, string> = {
  bun: 'bun install',
  npm: 'npm install',
  pnpm: 'pnpm install',
  yarn: 'yarn install',
}

export default class Install extends Command {
  static args = {
    packageManager: Args.string({description: 'target package manager', options: ['yarn', 'npm', 'pnpm', 'bun']}),
  }

  static description =
    'Run install using a specified package manager. If no package manager is specified, zen will search for any lock file within the directory and assume that package manager.'

  public async run(): Promise<void> {
    const {args} = await this.parse(Install)

    let _targetPackageManager: (typeof args)['packageManager']
    if (args.packageManager !== undefined) {
      _targetPackageManager = args.packageManager
    } else {
      const pm = await preferredPM(process.cwd())
      if (pm) {
        _targetPackageManager = pm.name
        this.log(`Using ${pm.name}@${pm.version} to install packages.`)
      }
    }

    if (!_targetPackageManager) {
      this.error(`Could not resolve package manager.`)
    }

    if (!installers[_targetPackageManager]) {
      this.error(`Invalid package manager provided, expected bun, npm, yarn or pnpm.`)
    }

    if (_targetPackageManager === 'yarn') {
      const yarnIntegrityPath = path.join(process.cwd(), 'node_modules', '.yarn-integrity')
      if (fs.existsSync(yarnIntegrityPath)) {
        this.log(`Removing yarn integrity`)
        fs.rmSync(yarnIntegrityPath)
      }
    }

    const commandToExecute = installers[_targetPackageManager]
    this.log(`Running "${commandToExecute}"`)
    try {
      execSync(commandToExecute, {stdio: 'inherit'})
    } catch (err) {
      this.warn(`Failed to execute "${commandToExecute}" successfully. => ${err}`)
    }
  }
}
