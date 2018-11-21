# JaPNaABotDiscord Bot
The bot

## Locations
Class: `require(“japnaabot”).Bot` <br>
Instance: `require(“japnaabot”).getBot()`

## Properties
### `Bot.id`
`public String`

UserId of the bot user

### `Bot.permissionsNamespace`
`public string`

The memory namespace used for permissions

### `Bot.permissionsAdmin`
`public string`

The Memory Permission key for the admin user

### `Bot.permissionsGlobal`
`public string`

The Memory Permission key for global permissions

### `Bot.memoryDelimiter`
`public string`

Memory name delimiter

Example: the memory delimiter is ".", and separates the parent and child names "parent.child"

### `Bot.client`
`private require("discord.io").Client`

Client from `require("discord.io")`

### `Bot.restartFunc`
`private function`

Function to call to restart itself

### `Bot.config`
`private object`

Configuration data

### `Bot.precommand`
`private string[]`

What comes before a command

Example: the precommand for `!help` is `!` because `!` comes before the command.

### `Bot.loggingLevel`
`private const number`

The logging level of the bot's Logger.
> 0: Fatal errors only <br>
> 1: Errors and above <br>
> 2: Warnings and above<br>
> 3: Info and above <br>
> 4: Message logging and above <br>

### `Bot.memoryPath`
`private string`

Path to memory

### `Bot.memory`
`private object`

The memory object

### `Bot.autoWriteSI`
`private NodeJS.Timeout`

The Timeout identifier for a timer that write memory to disk, every once in a while.

### `Bot.autoWriteInterval`
`private const number`

How often to write memory to disk automatically, in milliseconds

### `Bot.memoryChanged`
`private boolean`

Has the memory changed since the last write?

### `Bot.registeredCommands`
`private BotCommand[]`

A list of all the commands registered, commands that the bot will respond to.

The bot loops through this array backwards.

### `Bot.registeredPlugins`
`private Plugin[]`

A list of all the plugins registered

### `Bot.events`
`private object.<string, function[]>`

All event handlers

#### `Bot.events.message`
Triggered when a message is sent

#### `Bot.events.command`
Triggered when a command is sent

#### `Bot.events.send`
Triggered when the bot sends a message

#### `Bot.events.senddm`
Triggered when the bot sends a direct message

#### `Bot.events.sent`
Triggered when a message from the bot is confirmed to be sent

#### `Bot.events.start`
Triggered when the bot starts

#### `Bot.events.beforememorywrite`
Triggered before a memory write

#### `Bot.events.aftermemorywrite`
Triggered after a memory write

#### `Bot.events.addasync`
Triggered when an async request starts via Bot.newAsyncRequest

#### `Bot.events.doneasync`
Triggered when an async request finishes via Bot.doneAsyncRequest

### `Bot.activeAsyncRequests`
`private number`

The number of active asnyc requests running.

## Methods
### `Bot.prototype.addEventListener`
### `Bot.prototype.dispatchEvent`
### `Bot.prototype.newAsyncRequest`
### `Bot.prototype.doneAsyncRequest`
### `Bot.prototype.hasActiveAsyncRequests`
### `Bot.prototype.start`
### `Bot.prototype.stop`
### `Bot.prototype.restart`
### `Bot.prototype.registerPlugin`
### `Bot.prototype.registerCommand`
### `Bot.prototype.send`
### `Bot.prototype.sendDM`
### `Bot.prototype.remember`
### `Bot.prototype.recall`
### `Bot.prototype.getConfig_plugin`
### `Bot.prototype.writeMemory`
### `Bot.prototype.onready`
### `Bot.prototype.onmessage`
### `Bot.prototype.oncommand`
### `Bot.prototype.getChannel`
### `Bot.prototype.getSeverFromChannel`
### `Bot.prototype.getServer`
### `Bot.prototype.createLocationKey_global`
### `Bot.prototype.createLocationKey_server`
### `Bot.prototype.createLocationKey_channel`
### `Bot.prototype.createLocationKey_user_global`
### `Bot.prototype.createLocationKey_user_server`
### `Bot.prototype.createLocationKey_user_channel`
### `Bot.prototype.getUser_channel`
### `Bot.prototype.getUser_server`
### `Bot.prototype.getPermissions_global`
### `Bot.prototype.getPermissions_channel`
### `Bot.prototype.getPermissions_server`
### `Bot.prototype.editPermissions_user_channel`
### `Bot.prototype.editPermissions_user_server`
### `Bot.prototype.editPermissions_user_global`
### `Bot.prototype.playGame`