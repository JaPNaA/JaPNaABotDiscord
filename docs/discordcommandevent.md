# JaPNaABotDiscord DiscordCommandEvent
A discord event, triggered when a command is recieved.

## Locations
Class: require(“japnaabot”).events.BotCommandEvent

Instance: Obtainable via 2nd argument of a function passed as the 2nd argument of Bot.registerCommand. See example below.
```javascript
Bot.registerCommand("command name", function(bot, event, args) {
    Logger.log(event); // event instanceof DiscordCommandEvent
});
```

## Properties
## Methods