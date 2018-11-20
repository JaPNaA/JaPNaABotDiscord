# JaPNaABotDiscord
This is the repository for JaPNaABot.


## Installing (npm)
### Installing the bot
```sh
npm install gitlab:JaPNaA/japnaabotdiscord --save
```
### Using the bot
```javascript
require("japnaabot");
```

## Installing (direct download)
### Setting up
First, you must create a Discord application, add a bot, and get the access token. <br>
Rename .env\_sample to .env, and insert the access token into the file. <br>
You can start the bot by using the command `node .` or `npm start`

### Customization
All customization settings are in config.json.

### Adding your own commands
To add your own commands, you must create a .js file in the plugins directory.

Start the file with the boilerplate code:
```javascript
const BotPlugin = require("../src/plugin.js");
const BotCommandOptions = require("../src/botcommandOptions.js");
const Logger = require("../src/logger.js");

/**
 * @typedef {import("../src/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../src/bot.js")} Bot
 */

/**
 * Example command
 */
class MyPlugin extends BotPlugin {
    constructor(bot) {
        super(bot);
        // initialize variables here
    }

    /**
     * Example command
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args echos text back
     */
    mycommand(bot, event, args) {
        bot.send(event.channelId, args);
        Logger.log("mycommand was ran");
    }

    _start() {
        this._registerCommand("mycommand", this.mycommand, new BotCommandOptions({
            // command options
        }));
        // register more commands here
    }
}

module.exports = MyPlugin;
```

Save the file as [Your plugin name].js, and add it to the config.json plugins list as [Your plugin name]

### Updating the bot
If you've only changed config.json, and the plugins directory, you can simply
update the bot by re-downloading the repo and copy `config.json`, 
`memory.json`, and `plugins/` to the new repo, replacing any existing files.