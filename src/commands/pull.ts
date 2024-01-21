import {Command} from '@oclif/core'
import {Listr} from 'listr2'

import {AddListr_InstallListr} from './add'

export default class Pull extends Command {
  static description = 'Pulls/Updates zen packages'

  public async run(): Promise<void> {
    await new Listr({
      task: () => AddListr_InstallListr(true),
      title: 'Pulling...',
    })
      .run()
      .catch((err) => this.error(err))
  }
}
