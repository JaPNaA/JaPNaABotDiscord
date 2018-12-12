# JaPNaABotDiscord
JaPNaABot is a general bot with general bot things.




## Installing
```sh
npm install gitlab:JaPNaA/japnaabotdiscord --save
```
As simple as that. (Just... don't forget about the creating the folder part, `npm init`, you know)

This takes approx. 2.4MB as of writing.

## Using the bot
Here's a simple boilerplate to get you started

```javascript
const jbot = require("japnaabot");

// Arguments are: 
//   apiKey: string, token obtainable via Discord's developer site
//   config: object, the bot's configuration, this overwrites any default config
//   pathToMemory: a path to where the bot can store it's brain, if it doesn't exist, it will make one itself.
jbot.start("<your api token>", {}, "./memory.json");

// On CTRL-C
process.on("SIGINT", () => 
    // Stop the bot (async), with 1000 millisecond until timeout
    jbot.stop(1000)
        // then exit
        .then(() => process.exit(0))
);
```
This will connect your bot to Discord, and register a few built-in plugins: *"default"*, and *"japnaa"*. <br>
These plugins contain commands that you can execute. <br>
You can view all commands by messaging the bot `!help`.

You can add your own simple command like this:
```javascript
jbot.getBot().registerCommand("hello world", function(bot, event, args) {
    bot.send(event.channelId, "World: Hello!");
});
```
Try it by sending the bot: `!hello world`

You can configure the bot by editing the config. Replace the `japnaabot.start(...` line from the boilerplate with
```javascript
jbot.start("<your api token>", {
    "bot.precommand": [
        "my bot, do "
    ]
}, "./memory.json");
```
And now, the bot should no long respond to `!hello world`, and instead respond to `my bot, do hello world`

There’s another built-in plugin that hasn't been loaded in, "japnaa_weird" <br>
As the name suggests, this adds some weirder things to the bot.

You can add it with
```javascript
jbot.loadBuiltinPlugin("japnaa_weird");
```

This plugin adds some weirder features that I suspect not everyone will want, (that's why its not auto-loaded)
  - respond to different variants of "lol"
  - add commands `jap`, `tetris`, and `your`


For further information, see the [docs](docs/index.md)