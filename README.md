# Zen Package Manager

Manage your packages locally without publishing to a remote registry

> [!CAUTION]
> Zen CLI is in beta, breaking changes may occur.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->

- [Zen Package Manager](#zen-package-manager)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @mekstuff/zen
$ zen COMMAND
running command...
$ zen (--version)
@mekstuff/zen/1.0.0 win32-x64 node-v22.14.0
$ zen --help [COMMAND]
USAGE
  $ zen COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`zen add PACKAGES`](#zen-add-packages)
- [`zen backup [OUTPUT]`](#zen-backup-output)
- [`zen batch COMMAND`](#zen-batch-command)
- [`zen help [COMMANDS]`](#zen-help-commands)
- [`zen import PACKAGES`](#zen-import-packages)
- [`zen install [PACKAGEMANAGER]`](#zen-install-packagemanager)
- [`zen list`](#zen-list)
- [`zen pack OUT`](#zen-pack-out)
- [`zen plugins`](#zen-plugins)
- [`zen plugins:install PLUGIN...`](#zen-pluginsinstall-plugin)
- [`zen plugins:inspect PLUGIN...`](#zen-pluginsinspect-plugin)
- [`zen plugins:install PLUGIN...`](#zen-pluginsinstall-plugin-1)
- [`zen plugins:link PLUGIN`](#zen-pluginslink-plugin)
- [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin)
- [`zen plugins reset`](#zen-plugins-reset)
- [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin-1)
- [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin-2)
- [`zen plugins update`](#zen-plugins-update)
- [`zen publish`](#zen-publish)
- [`zen pull`](#zen-pull)
- [`zen push`](#zen-push)
- [`zen remove PACKAGES`](#zen-remove-packages)
- [`zen restore FILE`](#zen-restore-file)
- [`zen stage STAGE`](#zen-stage-stage)
- [`zen unpublish`](#zen-unpublish)
- [`zen yarn`](#zen-yarn)

## `zen add PACKAGES`

Adds zen packages to the directory. Please note than zen never installs with a package manager, You have to manually run your package manager after zen, for automation refer to the script lifecycles of zen.

```
USAGE
  $ zen add PACKAGES [-D] [--import] [-O] [-P] [--symlinked] [--traverse_imports]

ARGUMENTS
  PACKAGES  Packages to add

FLAGS
  -D, --dev           Add as a devDependency
  -O, --optional      Add as a optionalDependency
  -P, --peer          Add as a peerDependency
  --import            Import the package ( The package will be added to a .zen directory, meaning you can publish the
                      package without publishing the .zen dependencies )
  --symlinked
  --traverse_imports  Traverse imports ( all dependencies will be imported aswell )

DESCRIPTION
  Adds zen packages to the directory. Please note than zen never installs with a package manager, You have to manually
  run your package manager after zen, for automation refer to the script lifecycles of zen.
```

_See code: [dist/commands/add.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/add.ts)_

## `zen backup [OUTPUT]`

Creates a copy of the current global store inside your current working directory which you can revert to by using "zen restore <FILE>"

```
USAGE
  $ zen backup [OUTPUT]

ARGUMENTS
  OUTPUT  file to read

DESCRIPTION
  Creates a copy of the current global store inside your current working directory which you can revert to by using "zen
  restore <FILE>"
```

_See code: [dist/commands/backup.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/backup.ts)_

## `zen batch COMMAND`

Executes the given command in a loop within the current working directory.

```
USAGE
  $ zen batch COMMAND [--warnErrors]

ARGUMENTS
  COMMAND  The command to be executed.

FLAGS
  --warnErrors  catches any errors and warns them to console.

DESCRIPTION
  Executes the given command in a loop within the current working directory.
```

_See code: [dist/commands/batch.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/batch.ts)_

## `zen help [COMMANDS]`

Display help for zen.

```
USAGE
  $ zen help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for zen.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.9/lib/commands/help.ts)_

## `zen import PACKAGES`

Adds a package with the --import flag passed. Also provides a shorten "T" flag for traversing imports

```
USAGE
  $ zen import PACKAGES [-D] [-O] [-P] [-T]

ARGUMENTS
  PACKAGES  Packages to import

FLAGS
  -D, --dev               Add as a devDependency
  -O, --optional          Add as a optionalDependency
  -P, --peer              Add as a peerDependency
  -T, --traverse_imports  Traverse imports ( all dependencies will be imported aswell )

DESCRIPTION
  Adds a package with the --import flag passed. Also provides a shorten "T" flag for traversing imports
```

_See code: [dist/commands/import.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/import.ts)_

## `zen install [PACKAGEMANAGER]`

Run install using a specified package manager. If no package manager is specified, zen will search for any lock file within the directory and assume that package manager.

```
USAGE
  $ zen install [PACKAGEMANAGER]

ARGUMENTS
  PACKAGEMANAGER  (yarn|npm|pnpm|bun) target package manager

DESCRIPTION
  Run install using a specified package manager. If no package manager is specified, zen will search for any lock file
  within the directory and assume that package manager.
```

_See code: [dist/commands/install.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/install.ts)_

## `zen list`

Lists installed zen packages and their dependencies.

```
USAGE
  $ zen list [--tree]

FLAGS
  --tree  @todo Log the dependency tree

DESCRIPTION
  Lists installed zen packages and their dependencies.
```

_See code: [dist/commands/list.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/list.ts)_

## `zen pack OUT`

Packs a package

```
USAGE
  $ zen pack OUT [--scripts]

FLAGS
  --scripts  Runs pack lifecycle scripts

DESCRIPTION
  Packs a package
```

_See code: [dist/commands/pack.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/pack.ts)_

## `zen plugins`

List installed plugins.

```
USAGE
  $ zen plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ zen plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/index.ts)_

## `zen plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ zen plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ zen plugins add

EXAMPLES
  $ zen plugins add myplugin

  $ zen plugins add https://github.com/someuser/someplugin

  $ zen plugins add someuser/someplugin
```

## `zen plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ zen plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ zen plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/inspect.ts)_

## `zen plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ zen plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ zen plugins add

EXAMPLES
  $ zen plugins install myplugin

  $ zen plugins install https://github.com/someuser/someplugin

  $ zen plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/install.ts)_

## `zen plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ zen plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help      Show CLI help.
  -v, --verbose
  --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ zen plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/link.ts)_

## `zen plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ zen plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ zen plugins unlink
  $ zen plugins remove

EXAMPLES
  $ zen plugins remove myplugin
```

## `zen plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ zen plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/reset.ts)_

## `zen plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ zen plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ zen plugins unlink
  $ zen plugins remove

EXAMPLES
  $ zen plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/uninstall.ts)_

## `zen plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ zen plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ zen plugins unlink
  $ zen plugins remove

EXAMPLES
  $ zen plugins unlink myplugin
```

## `zen plugins update`

Update installed plugins.

```
USAGE
  $ zen plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/lib/commands/plugins/update.ts)_

## `zen publish`

Publishes a package locally.

```
USAGE
  $ zen publish [--scripts]

FLAGS
  --[no-]scripts  Runs publish lifecycle scripts (no publish related scripts are ran, only pack scripts.)

DESCRIPTION
  Publishes a package locally.
```

_See code: [dist/commands/publish.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/publish.ts)_

## `zen pull`

Pulls/Updates zen packages

```
USAGE
  $ zen pull

DESCRIPTION
  Pulls/Updates zen packages
```

_See code: [dist/commands/pull.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/pull.ts)_

## `zen push`

Pushes the latest published version of the package to all installations.

```
USAGE
  $ zen push

DESCRIPTION
  Pushes the latest published version of the package to all installations.
```

_See code: [dist/commands/push.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/push.ts)_

## `zen remove PACKAGES`

Removes a zen package from the directory

```
USAGE
  $ zen remove PACKAGES

ARGUMENTS
  PACKAGES  Packages to remove

DESCRIPTION
  Removes a zen package from the directory
```

_See code: [dist/commands/remove.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/remove.ts)_

## `zen restore FILE`

describe the command here

```
USAGE
  $ zen restore FILE

ARGUMENTS
  FILE  [default: C:\Users\Olanzo\Documents\Github\mekstuff\zen\global.store.backup.json] Backup restore JSON file.

DESCRIPTION
  describe the command here

EXAMPLES
  $ zen restore
```

_See code: [dist/commands/restore.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/restore.ts)_

## `zen stage STAGE`

describe the command here

```
USAGE
  $ zen stage STAGE [--exact_version]

ARGUMENTS
  STAGE
      (production|development|prod|dev) The current "stage", production | development. In production mode, all zen
      packages in your package.json will be converted to using their listed version aka your production ready
      counterparts.

      e.g. "@mekstuff/package: file:path/to/file" will become "@mekstuff/package: x.x.x"

      Expected to be used in your "prePublishOnly" and "postpublish" script lifecycle.

FLAGS
  --exact_version  Swap to the exact currently installed version. e.g. ^1.5.6 will be converted to 1.5.6 once it's the
                   version installed.

DESCRIPTION
  describe the command here

EXAMPLES
  $ zen stage
```

_See code: [dist/commands/stage.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/stage.ts)_

## `zen unpublish`

Unpublish a package

```
USAGE
  $ zen unpublish

DESCRIPTION
  Unpublish a package
```

_See code: [dist/commands/unpublish.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/unpublish.ts)_

## `zen yarn`

Runs "yarn install", removes .yarn-integrity so local zen packages are installed correctly. _You should use zen install yarn_ instead

```
USAGE
  $ zen yarn

DESCRIPTION
  Runs "yarn install", removes .yarn-integrity so local zen packages are installed correctly. *You should use zen
  install yarn* instead
```

_See code: [dist/commands/yarn.ts](https://github.com/mekstuff/zen/blob/v1.0.0/dist/commands/yarn.ts)_

<!-- commandsstop -->
