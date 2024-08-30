# Zen Package Manager

Manage your packages locally without publishing to a remote registry

> [!CAUTION]
> zen is still WIP and is not recommended for production.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Zen Package Manager](#zen-package-manager)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g zen
$ zen COMMAND
running command...
$ zen (--version)
zen/1.0.0 win32-x64 node-v20.12.0
$ zen --help [COMMAND]
USAGE
  $ zen COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`zen help [COMMANDS]`](#zen-help-commands)
* [`zen plugins`](#zen-plugins)
* [`zen plugins:install PLUGIN...`](#zen-pluginsinstall-plugin)
* [`zen plugins:inspect PLUGIN...`](#zen-pluginsinspect-plugin)
* [`zen plugins:install PLUGIN...`](#zen-pluginsinstall-plugin-1)
* [`zen plugins:link PLUGIN`](#zen-pluginslink-plugin)
* [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin)
* [`zen plugins reset`](#zen-plugins-reset)
* [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin-1)
* [`zen plugins:uninstall PLUGIN...`](#zen-pluginsuninstall-plugin-2)
* [`zen plugins update`](#zen-plugins-update)

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
