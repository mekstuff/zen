import fs from 'fs'
import path from 'path'

import {ZENLOCKFILENAME, ZenLockFile} from './zen-files'

export function ReadZenLockFile(cwd: string = process.cwd()): ZenLockFile {
  const lockPath = path.join(cwd, ZENLOCKFILENAME)
  if (!fs.existsSync(lockPath)) {
    throw Error(`No lock file exists: ${lockPath}`)
  }
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8')) as ZenLockFile
  return lock
}
