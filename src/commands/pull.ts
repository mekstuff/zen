import {Command, Flags} from '@oclif/core'
import {Listr} from 'listr2'

import {AddListr_InstallListr} from './add'

export default class Pull extends Command {
  static description = 'Pulls/Updates zen packages'
  static flags = {
    force: Flags.boolean({char: 'f', default: false, description: 'Force pulling no matter if up to date.'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Pull)

    await new Listr({
      task: () => AddListr_InstallListr(true, {force_update: flags.force}),
      title: 'Pulling...',
    })
      .run()
      .catch((err) => this.error(err))
  }
}
