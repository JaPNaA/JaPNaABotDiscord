# JaPNaABotDiscord DiscordMessageEvent
An discord event, triggered when a message is recieved.

## Locations
Class: require(“japnaabot”).events.DiscordMessageEvent

Instance: Obtainable via 2nd argument of a function passed as the 2nd argument of Bot.addEventListener("message", ...) See example below.
```javascript
Bot.addEventListener("message", function(bot, event) {
    Logger.log(event); // event instanceof DiscordMessageEvent
});
```

## Properties
## Methods