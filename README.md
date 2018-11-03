# JaPNaABotDiscord
This is the repository for JaPNaABot.

## Setting up
First, you must create a Discord application, add a bot, and get the access token. <br>
Rename .env\_sample to .env, and insert the access token into the file. <br>
You can start the bot by using the command `node .` or `npm start`

## Customization
All customization settings are in config.json.

## Adding your own commands
To add your own commands, you must create a .js file in the plugins directory.

Start the file with the boilerplate code:
```javascript
const BotPlugin = require("../plugin.js");

class MyPlugin extends BotPlugin {
    constructor(bot) {
        super(bot);
        // you can initialize variables here
    }

    mycommand(bot, event, args) {
        bot.send(event.channelId, args);
    }

    _start() {
        this._registerCommand("mycommand", this.mycommand);
        // commands don't get automagically registered. You have to register them yourself.
    }
}

module.exports = MyPlugin;
```

Save the file as [Your plugin name].js, and add it to the config.json plugins list as [Your plugin name]
