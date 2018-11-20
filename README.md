# JaPNaABotDiscord
JaPNaABot is a general bot with general bot things.




## Installing
```sh
npm install git+https://gitlab.com/JaPNaA/japnaabotdiscord.git --save
```
As simple as that. (Just... don't forget about the creating the folder part, `npm init`, you know)

This takes approx. 1.3MB as of writing.

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
japanaabot.getBot().registerCommand("hello world", function(bot, event, args) {
    bot.send(event.channelId, "World: Hello!");
});
```
Try it by sending the bot: `!hello world`

You can configure the bot by editing the config. Replace the `japnaabot.start(...` line from the boilerplate with
```javascript
japnaabot.start("<your api token>", {
    "bot.precommand": [
        "my bot, do "
    ]
}, "./memory.json");
```
And now, the bot should no long respond to `!hello world`, and instead respond to `my bot, do hello world`

There are a few built-in plugins that can add some useful commands. <br>
For example, the `default` plugin.

You can add it with
```javascript
japnaabot.loadBuiltinPlugin("default");
```

And now the bot will have some new commands available to it, such as
  - `eval` (admin only)
  - `pretendget` (admin only)
  - `ping`
  - `userinfo`
  - `I am the bot admin` (first person to run this is granted 'BOT_ADMINISTRATOR' permissions)
  - `invite`
  - `link`
  - `code`