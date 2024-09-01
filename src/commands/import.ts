import {Args, Command, Flags} from '@oclif/core'
import {AddCommandFlags, AddListr} from './add'

export default class Import extends Command {
  static description =
    'Adds a package with the --import flag passed. Also provides a shorten "T" flag for traversing imports'

  static flags = {
    dev: AddCommandFlags.dev,
    optional: AddCommandFlags.optional,
    peer: AddCommandFlags.peer,
    traverse_imports: Flags.boolean({
      char: 'T',
      ...AddCommandFlags.traverse_imports,
    }),
  }

  static args = {
    packages: Args.string({description: 'Packages to import', multiple: true, required: true}),
  }

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Import)
    await AddListr(argv as string[], {
      dev: flags.dev,
      import: true,
      optional: flags.optional,
      peer: flags.peer,
      traverse_imports: flags.traverse_imports,
    })
      .run()
      .catch((err) => this.error(err))
  }
}
