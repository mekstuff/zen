/*
    Typed with ❤️ @mekstuff
    11/09/2025 13:25:42
*/

import {findUp} from 'find-up'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'

const ZenConfigFileName = 'zen.config.yaml'
export type ZenConfigFileData = {
  ['hoist-imports']?: boolean
}
export type ZenConfigFileInfo = {
  Config: ZenConfigFileData
  ConfigPath: string
  ConfigRootPath: string
}

export async function GetProjectsZenConfigFilePath(cwd: string = process.cwd()): Promise<string | undefined> {
  const ConfigFilePath = await findUp(ZenConfigFileName, {cwd: cwd})
  if (ConfigFilePath == undefined) {
    return undefined
  }

  return ConfigFilePath
}

export async function ReadProjectsZenConfigFilePath(
  cwd: string = process.cwd(),
): Promise<ZenConfigFileInfo | undefined> {
  const ConfigFilePath = await GetProjectsZenConfigFilePath(cwd)
  if (ConfigFilePath === undefined) {
    return undefined
  }
  const File = fs.readFileSync(ConfigFilePath, 'utf-8')
  const Parsed = YAML.parse(File) as ZenConfigFileData

  return {
    Config: Parsed,
    ConfigPath: ConfigFilePath,
    ConfigRootPath: path.join(ConfigFilePath, '..'),
  }
}
