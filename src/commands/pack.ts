import {Args, Command, Flags} from '@oclif/core'
import {Listr} from 'listr2'
import {manifest, tarball} from 'pacote'

import fs = require('fs')
const Arborist = require('@npmcli/arborist')
const runScript = require('@npmcli/run-script')

import {GetTarballContentsAsync} from '../utils/tar-tarball'
import {ReadExistingPackageJSON, package_json_read_file} from '../utils/zen-core'

import path = require('path')

type PackContext = {
  pack_signature: string
  packageJSON: package_json_read_file
}

/**
 * returns the `Listr` object that handles packing.
 *
 * @param out The directory in wihich the "packed" file will be placed.
 * @param runScripts Run the pack scripts lifecycles
 * @returns ListrObject
 */
export function PackListr(out: string, runScripts: boolean) {
  return new Listr<PackContext>(
    [
      {
        task: (ctx) => {
          ctx.packageJSON = ReadExistingPackageJSON()
        },
      },
      {
        task: async (ctx, task) => {
          if (runScripts === true) {
            await runScript({
              event: 'prepack',
              path: process.cwd(),
              stdio: 'inherit',
            })
          }
          const fileManifest = await manifest('file:.')
          const fileTarball = await tarball(fileManifest._resolved, {
            Arborist,
            integrity: fileManifest._integrity,
          })
          task.output = 'Packing...'
          const Contents = await GetTarballContentsAsync(fileManifest, fileTarball)
          ctx.pack_signature = Contents.shasum.replace('/', '_') // replace any / that can make path a "directory" since we use pack_signature for writing files
          Contents.files.forEach((file) => {
            const parsedPath = path.parse(file.path)
            if (parsedPath.dir !== '') {
              fs.mkdirSync(path.join(out, parsedPath.dir), {
                recursive: true,
              })
            }
            fs.cpSync(file.path, path.join(out, file.path), {force: true, recursive: true})
          })
          task.title = `Packed ${out}\n(${Contents.entryCount}) entries ${Contents.size}KB || ${Contents.shasum}`
          if (runScripts === true) {
            await runScript({
              event: 'postpack',
              path: out, // run postpack on the created tarball directory (not sure if this is how it works with npm...)
              stdio: 'inherit',
            })
          }
        },
        title: `Packing to ${out}`,
      },
    ],
    {concurrent: false},
  )
}

export default class Pack extends Command {
  static args = {
    out: Args.string({required: true}),
  }
  static description = 'Packs a package'
  static flags = {
    scripts: Flags.boolean({default: true, description: 'Runs pack lifecycle scripts'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Pack)
    await PackListr(args.out, flags.scripts).run()
  }
}
