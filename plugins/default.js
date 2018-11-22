const BotPlugin = require("../src/plugin.js");
const BotCommandOptions = require("../src/botcommandOptions.js");
const BotCommandHelp = require("../src/botcommandHelp.js");
const { toUserId } = require("../src/utils.js");
const { inspect } = require("util");

/**
 * @typedef {import("../src/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../src/bot.js")} Bot
 */

/**
 * Normal commands every bot shoud have
 */
class Default extends BotPlugin {
    constructor(bot) {
        super(bot);
    }

    /**
     * ping bot
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    ping(bot, event) {
        bot.send(event.channelId, "Pong! Took " + bot.client.ping + "ms"); //* should be using abstraction
    }

    /**
     * 
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args args string
     */
    eval(bot, event, args) {
        let str = inspect(eval(args));
        str = str.replace(/ {4}/g, "\t");

        if (str.length > 1994) {
            str = str.slice(0, 1991) + "...";
        }

        bot.send(event.channelId, "```" + str + "```");
    }

    /**
     * get user info
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args userId
     */
    userinfo(bot, event, args) {
        let userId = event.userId;

        /** @type {Object.<string, string>[]} */
        let response = [];

        if (args) {
            let newUserId = toUserId(args);
            if (newUserId) {
                userId = newUserId;
            } else {
                bot.send(event.channelId, "**User does not exist.**");
                return;
            }
        }

        let user = bot.getUser(userId);

        if (user) {
            let avatarUrl = "https://cdn.discordapp.com/avatars/" + userId + "/" + user.avatar + ".png?size=1024";

            let userStr = 
                "Username: " + user.username +
                "\nDiscriminator: " + user.discriminator +
                "\nId: " + user.id + 
                "\nAvatar: [" + user.avatar + "](" + avatarUrl + ")" +
                "\nBot: " + user.bot +
                "\nGame: " + JSON.stringify(user.game);

            response.push({
                name: "User info",
                value: userStr + "\n"
            });

            if (!event.isDM) {
                let userInServer = bot.getUser_server(userId, event.serverId);
                let userInServerStr = 
                    "Roles: " + (userInServer.roles.length >= 1 ? 
                        userInServer.roles.map(
                            roleId => 
                                "**" + bot.getRole(roleId, event.serverId).name + 
                                "** (" + roleId + ")"
                        ).join(", ") :
                        "none") + 
                    "\nIs mute: " + (userInServer.mute ? "Yes" : "No") +
                    "\nIs deaf: " + (userInServer.deaf ? "Yes" : "No") +
                    "\nId: " + userInServer.id + 
                    "\nJoined: " + userInServer.joined_at +
                    "\nStatus: " + userInServer.status +
                    "\nNick: " + userInServer.nick +
                    "\nVoice Channel Id: " + userInServer.voice_channel_id;

                response.push({
                    name: "User of server info",
                    value: userInServerStr + "\n"
                });

                const permissions = bot.getPermissions_channel(userId, event.serverId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            } else {
                const permissions = bot.getPermissions_global(userId);
                response.push({
                    name: "Global permissions",
                    value: permissions.customToString() + "\n"
                });
            }
            

            bot.send(event.channelId, {
                embed: {
                    color: bot.themeColor,
                    author: {
                        name: "Information for " + user.username,
                        icon_url: avatarUrl + "?size=128"
                    },
                    fields: response,
                    timestamp: new Date()
                }
            });
        } else {
            bot.send(event.channelId, "**User does not exist.**");
        }
    }

    /**
     * Converts all commands to a readable format
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event data
     */
    _allCommandsToReadable(bot, event) {
        return bot.registeredCommands.map(command => {
            let name = command.commandName;
            let canRun = true;

            if (
                command.requiredPermission !== undefined &&
                !bot.getPermissions_channel(event.userId, event.serverId, event.channelId)
                    .has(command.requiredPermission)
            ) {
                canRun = false;
            }

            if (command.noDM && event.isDM) {
                canRun = false;
            }

            if (canRun) {
                return "**`" + name + "`**";
            } else {
                return "`" + name + "`";
            }
        }).join(", ");
    }

    /**
     * Sends general help information
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    _sendGeneralHelp(bot, event) {
        /** @type {Object.<string, string>[]} */
        let response = [];
        let embed = {
            color: bot.themeColor,
            title: "Help",
            fields: response
        };

        response.push({
            name: "Commands",
            value: this._allCommandsToReadable(bot, event) + "\n" +
                "*Any commands in bold are ones you can run " + (event.isDM ? "here" : "there") + "*\n" +
                "*You can type " + event.precommand + "help [commandName] to get more information on a command.*"
        });

        if (event.isDM) {
            bot.send(event.channelId, { embed });
        } else {
            // is server
            bot.send(event.channelId, "I've sent you some help!");
            bot.sendDM(event.userId, { embed });
        }
    }

    /**
     * Sends help about a single command
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} command name of command to send help of
     */
    _sendHelpAbout(bot, event, command) {
        let help = bot.getHelp(command);

        if (help) {
            let fields = [];

            // overloads and arguments
            if (help.overloads) {
                for (let overload of help.overloads) {
                    let value = [];
                    let args = Object.keys(overload);
    
                    for (let argument of args) {
                        value.push("**" + argument + "** - " + overload[argument]);
                    }
    
                    fields.push({
                        name: event.precommand + command + " *" + args.join(" ") + "*",
                        value: value.join("\n")
                    });
                }
            }

            // examples
            if (help.examples) {
                fields.push({
                    name: "**Examples**",
                    value: help.examples.map(e => 
                        "`" + event.precommand + e[0] + "` - " + e[1] + ""
                    ).join("\n")
                });
            }

            // send message
            bot.send(event.channelId, {
                embed: {
                    color: bot.themeColor,
                    title: "**" + event.precommand + command + "**",
                    description: help.description ? help.description : "The " + command + " command",
                    fields: fields
                }
            });
        } else if (help === undefined) {
            bot.send(event.channelId, "Command `" + command + "` doesn't exist");            
        } else {
            bot.send(event.channelId, "Help for command `" + command + "` doesn't exist");
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args arguments
     */
    help(bot, event, args) {
        let cleanArgs = args.toLowerCase().trim();
        
        if (cleanArgs) {
            this._sendHelpAbout(bot, event, cleanArgs);
        } else {
            this._sendGeneralHelp(bot, event);
        }
    }

    /**
     * Sets the bot admin
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    i_am_the_bot_admin(bot, event) {
        if (bot.recall(bot.permissionsNamespace, bot.permissionsAdmin)) {
            if (bot.recall(bot.permissionsNamespace, bot.permissionsAdmin) === event.userId) {
                bot.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                bot.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            bot.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            bot.remember(bot.permissionsNamespace, bot.permissionsAdmin, event.userId, true);

            bot.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args arguments
     */
    pretendget(bot, event, args) {
        let tagMatch = args.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            bot.send(event.channelId, "<insert help message>");
            return;
        }

        let userId = toUserId(tagMatch[0]);
        let user = bot.getUser(userId);
        let message = args.slice(tagMatch[0].length);

        bot.onmessage(user.username, user.id, event.channelId, message, event.wsevent);
    }

    /**
     * Sends a message to a channel
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args arguments [channelId, ...message]
     */
    send(bot, event, args) {
        let whitespaceIndex = args.match(/\s/).index;

        bot.send(args.slice(0, whitespaceIndex), args.slice(whitespaceIndex + 1));
    }

    /**
     * Sends link to add bot to server
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    link(bot, event) {
        bot.send(event.channelId, {
            embed: {
                color: bot.themeColor,
                description: "You can add me to another server with this link:\n" + bot.config.addLink
            }
        });
    }

    /**
     * Sends link to view code of bot (like what you're doing right now!)
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    code(bot, event) {
        bot.send(event.channelId, "You can view my code here:\n" + bot.config.gitlabLink);
    }

    _start() {
        this._registerCommand("eval", this.eval, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "Evaluates the arguments as JavaScript.",
                overloads: [{
                    "code": "Code to evaluate"
                }],
                examples: [
                    ["eval 1 + 1", "Will give you the result of 1 + 1 (2)"],
                    ["eval bot", "Will give you the entire bot object in JS"]
                ]
            })
        }));
        
        this._registerCommand("pretendget", this.pretendget, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "The bot will pretend that it recieved a message.",
                overloads: [{
                    "userId": "From user by UserID raw or as a @metion",
                    "message": "The message that it will mention"
                }],
                examples: [
                    ["pretendget <@207890448159735808> !userinfo", "Will make the bot pretend that the message actually came from <@207890448159735808>."]
                ]
            })
        }));

        this._registerCommand("send", this.send, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "Makes the bot send a message to a specified channel.",
                overloads: [{
                    "channelId": "ID of channel. The bot must be in this channel.",
                    "message": "The message that the bot will send in that channel."
                }],
                examples: [
                    ["send 501917691565572118 hi", "Will send a message to the channel with the ID 501917691565572118 a friendly \"hi\""]
                ]
            })
        }));

        this._registerCommand("ping", this.ping, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Pings the bot and tells you how long it took for the bot to receive the message.",
                examples: [
                    ["ping", "Do you *really* need an example?"]
                ]
            })
        }));
        this._registerCommand("userinfo", this.userinfo, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Gives you information about the user. (Exposing)",
                overloads: [{
                    "none": "Leave empty, defaulting to yourself"
                }, {
                    "userId": "From user by UserID raw or as a @metion. The bot will show user information about this user",
                }],
                examples: [
                    ["userinfo", "Will cause the bot to expose you."],
                    ["userinfo <@207890448159735808>", "Will cause the bot to expose <@207890448159735808>"]
                ]
            })
        }));
        this._registerCommand("help", this.help, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Gives you help. And, you just looked up help for help. Something tells me you need some more help.",
                overloads: [{
                    "none": "Leave empty, gives you a list of all the commands"
                }, {
                    "command": "Command to show help about",
                }],
                examples: [
                    ["help", "Replies with all the commands"],
                    ["help help", "Will give you help for the command help. Which you did, just now."]
                ]
            })
        }));
        
        this._registerCommand("i am the bot admin", this.i_am_the_bot_admin, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "The first person to run this command will become the bot admin. No one afterwards can become the bot admin.",
                examples: [
                    ["i am the bot admin", "Makes you the bot admin (if you're first)"]
                ]
            })
        }));
        
        this._registerCommand("invite", this.link, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            })
        }));
        this._registerCommand("link", this.link, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            })
        }));
        this._registerCommand("code", this.code, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the link to the code repository this bot is running on, you know. In case you want to build a clone of me.",
                examples: [
                    ["code", "Sends the link of the code in the current channel."]
                ]
            })
        }));
    }
}

module.exports = Default;