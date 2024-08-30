# Zen Package Manager

Manage your packages locally without publishing to a remote registry

> [!CAUTION]
> zen is still WIP and is not recommended for production.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g zen
$ zen COMMAND
running command...
$ zen (--version)
zen/0.0.0 win32-x64 node-v20.12.0
$ zen --help [COMMAND]
USAGE
  $ zen COMMAND
...
```

<!-- usagestop -->

```sh-session
$ npm install -g zen
$ zen COMMAND
running command...
$ zen (--version)
zen/0.0.0 win32-x64 node-v20.10.0
$ zen --help [COMMAND]
USAGE
  $ zen COMMAND
...
```

<!-- usagestop -->

```sh-session
$ npm install -g oclif-hello-world
$ oex COMMAND
running command...
$ oex (--version)
oclif-hello-world/0.0.0 darwin-x64 node-v16.13.1
$ oex --help [COMMAND]
USAGE
  $ oex COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`zen add PACKAGES`](#zen-add-packages)
- [`zen batch COMMAND`](#zen-batch-command)
- [`zen help [COMMANDS]`](#zen-help-commands)
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
- [`zen unpublish`](#zen-unpublish)
- [`zen yarn`](#zen-yarn)

## `zen add PACKAGES`

Adds zen packages to the directory. Please note than zen never installs with a package manager, You have to manually run your package manager after zen, for automation refer to the script lifecycles of zen.

```
USAGE
  $ zen add PACKAGES [-D] [--import] [-O] [-P] [--traverse_imports]

ARGUMENTS
  PACKAGES  Packages to add

FLAGS
  -D, --dev           Add as a devDependency
  -O, --optional      Add as a optionalDependency
  -P, --peer          Add as a peerDependency
  --import            Import the package ( The package will be added to a .zen directory, meaning you can publish the
                      package without publishing the .zen dependencies )
  --traverse_imports  Traverse imports ( all dependencies will be imported aswell )

DESCRIPTION
  Adds zen packages to the directory. Please note than zen never installs with a package manager, You have to manually
  run your package manager after zen, for automation refer to the script lifecycles of zen.

EXAMPLES
  $ zen add
```

_See code: [dist/commands/add.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/add.ts)_

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

_See code: [dist/commands/batch.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/batch.ts)_

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

_See code: [dist/commands/list.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/list.ts)_

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

_See code: [dist/commands/pack.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/pack.ts)_

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

_See code: [dist/commands/publish.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/publish.ts)_

## `zen pull`

Pulls/Updates zen packages

```
USAGE
  $ zen pull

DESCRIPTION
  Pulls/Updates zen packages
```

_See code: [dist/commands/pull.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/pull.ts)_

## `zen push`

Pushes the latest published version of the package to all installations.

```
USAGE
  $ zen push

DESCRIPTION
  Pushes the latest published version of the package to all installations.
```

_See code: [dist/commands/push.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/push.ts)_

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

_See code: [dist/commands/remove.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/remove.ts)_

## `zen unpublish`

Unpublish a package

```
USAGE
  $ zen unpublish

DESCRIPTION
  Unpublish a package
```

_See code: [dist/commands/unpublish.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/unpublish.ts)_

## `zen yarn`

Runs "yarn install", removes .yarn-integrity so local zen packages are installed correctly.

```
USAGE
  $ zen yarn

DESCRIPTION
  Runs "yarn install", removes .yarn-integrity so local zen packages are installed correctly.
```

_See code: [dist/commands/yarn.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/yarn.ts)_

<!-- commandsstop -->

- [`zen hello PERSON`](#zen-hello-person)
- [`zen hello world`](#zen-hello-world)
- [`zen help [COMMANDS]`](#zen-help-commands)
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

## `zen hello PERSON`

Say hello

```
USAGE
  $ zen hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/hello/index.ts)_

## `zen hello world`

Say hello world

```
USAGE
  $ zen hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ zen hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [dist/commands/hello/world.ts](https://github.com/mekstuff/zen/blob/v0.0.0/dist/commands/hello/world.ts)_

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

<!-- commandsstop -->

- [`oex hello PERSON`](#oex-hello-person)
- [`oex hello world`](#oex-hello-world)
- [`oex help [COMMAND]`](#oex-help-command)
- [`oex plugins`](#oex-plugins)
- [`oex plugins:inspect PLUGIN...`](#oex-pluginsinspect-plugin)
- [`oex plugins:install PLUGIN...`](#oex-pluginsinstall-plugin)
- [`oex plugins:link PLUGIN`](#oex-pluginslink-plugin)
- [`oex plugins:uninstall PLUGIN...`](#oex-pluginsuninstall-plugin)
- [`oex plugins update`](#oex-plugins-update)

## `oex hello PERSON`

Say hello

```
USAGE
  $ oex hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/oclif/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `oex hello world`

Say hello world

```
USAGE
  $ oex hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `oex help [COMMAND]`

Display help for oex.

```
USAGE
  $ oex help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for oex.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `oex plugins`

List installed plugins.

```
USAGE
  $ oex plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ oex plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `oex plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ oex plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ oex plugins:inspect myplugin
```

## `oex plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ oex plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ oex plugins add

EXAMPLES
  $ oex plugins:install myplugin

  $ oex plugins:install https://github.com/someuser/someplugin

  $ oex plugins:install someuser/someplugin
```

## `oex plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ oex plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ oex plugins:link myplugin
```

## `oex plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ oex plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oex plugins unlink
  $ oex plugins remove
```

## `oex plugins update`

Update installed plugins.

```
USAGE
  $ oex plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

<!-- commandsstop -->
