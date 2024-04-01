import fs from "fs";
import {Args, Command, Flags} from '@oclif/core'
import { execSync } from "child_process";
import path from "path";

export default class Batch extends Command {
  static description = 'describe the command here'

  static args = {
    command: Args.string({description: 'The command that will be executed', required: true}),
  }
  static flags = {
    warnErrors: Flags.boolean({default: false, description: 'catches any errors and warns them to console.'}),
  }
  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Batch)
    const readdir = fs.readdirSync(process.cwd());
    readdir.forEach((x, i) => {
      this.log(`Executing ${i} - "${x}"`);
      try {
        execSync(args.command, {cwd: path.join(process.cwd(), x), stdio: "inherit"});
      }catch(err) {
        if(flags.warnErrors) {
          this.warn(`BATCH ERR [SURPRESSED] :- ${err}`)
        }else {
          this.error(`BATCH ERR :- ${err}`)
        }
      }
    })
  }
}
