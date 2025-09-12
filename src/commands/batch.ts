import {Args, Command, Flags} from '@oclif/core'
import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

export default class Batch extends Command {
  static args = {
    command: Args.string({description: 'The command to be executed.', required: true}),
  }

  static description = 'Executes the given command in a loop within the current working directory.'

  static flags = {
    dir: Flags.string({
      aliases: ['d'],
      default: undefined,
      description: 'the directory relative to the current working directory.',
    }),
    warnErrors: Flags.boolean({default: false, description: 'catches any errors and warns them to console.'}),
  }
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Batch)
    const targetDirPath = flags.dir ? path.join(process.cwd(), flags.dir) : process.cwd()
    const readdir = fs.readdirSync(targetDirPath)
    readdir.forEach((x, i) => {
      this.log(`Executing (${i}) - "${x}"`)
      try {
        execSync(args.command, {cwd: path.join(targetDirPath, x), stdio: 'inherit'})
      } catch (err) {
        if (flags.warnErrors) {
          this.warn(`BATCH ERR [SURPRESSED] :- ${err}`)
        } else {
          this.error(`BATCH ERR :- ${err}`)
        }
      }
    })
  }
}
