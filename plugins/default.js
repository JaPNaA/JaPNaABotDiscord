const BotPlugin = require("../lib/plugin.js");
const BotCommandOptions = require("../lib/botcommandOptions.js");
const BotCommandHelp = require("../lib/botcommandHelp.js");
const Permissions = require("../lib/permissions.js");
const Logger = require("../lib/logger.js");
const { getSnowflakeNum, stringToArgs } = require("../lib/utils.js");
const { inspect } = require("util");

/**
 * @typedef {import("../lib/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../lib/bot/bot.js")} Bot
 * @typedef {import("../lib/botcommand.js")} BotCommand
 */

/**
 * Normal commands every bot shoud have
 */
class Default extends BotPlugin {
    constructor(bot) {
        super(bot);
        this._pluginName = "default";
    }

    /**
     * ping bot
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    ping(bot, event) {
        bot.send(event.channelId, "Pong! Took " + Math.round(bot.client.ping) + "ms"); //* should be using abstraction
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
     * Logs a message to the console with a logging level of "log"
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args message to log
     */
    log_message(bot, event, args) {
        Logger.log(args);
    }

    /**
     * get user info
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args userId
     */
    user_info(bot, event, args) {
        let userId = event.userId;

        /** @type {Object.<string, string>[]} */
        let response = [];

        if (args) {
            let newUserId = getSnowflakeNum(args);
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
                "\nPresence: " + JSON.stringify(user.presence);

            response.push({
                name: "User info",
                value: userStr + "\n"
            });

            if (!event.isDM) {
                let userInServer = bot.getUser_server(userId, event.serverId);

                let rolesString = (
                    userInServer.roles.size >= 1 ?
                        userInServer.roles.map(
                            role =>
                                "**" + role.name.replace(/@/g, "@\u200B") +
                                "** (" + role.id + ")"
                        ).join(", ") :
                        "none"
                );

                if (rolesString.length > 750) {
                    rolesString = rolesString.slice(0, 750) + "...";
                }

                let userInServerStr =
                    "Roles: " + rolesString +
                    "\nIs mute: " + (userInServer.mute ? "Yes" : "No") +
                    "\nIs deaf: " + (userInServer.deaf ? "Yes" : "No") +
                    "\nId: " + userInServer.id +
                    "\nJoined: " + userInServer.joinedAt +
                    "\nStatus: " + userInServer.user.presence.status +
                    "\nNick: " + userInServer.nickname +
                    "\nVoice Channel Id: " + userInServer.voiceChannelID;

                response.push({
                    name: "User of server info",
                    value: userInServerStr + "\n"
                });

                const permissions = bot.permission.getPermissions_channel(userId, event.serverId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            } else {
                const permissions = bot.permission.getPermissions_global(userId);
                response.push({
                    name: "Global permissions",
                    value: permissions.customToString() + "\n"
                });
            }


            bot.send(event.channelId, {
                embed: {
                    color: bot.config.themeColor,
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
     * @param {BotCommand[]} commands
     */
    _commandsToReadable(bot, event, commands) {
        return commands.map(command => {
            let name = command.commandName;
            let canRun = true;

            if (
                command.requiredPermission !== undefined &&
                !bot.permission.getPermissions_channel(event.userId, event.serverId, event.channelId)
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
        let fields = [];
        let embed = {
            color: bot.config.themeColor,
            title: "All Commands",
            fields: fields
        };

        for (let [groupName, commands] of bot.commandGroups) {
            fields.push({
                name: groupName || "Other",
                value: this._commandsToReadable(bot, event, commands)
            });
        }

        fields.push({
            name: "---",
            value: "*Any commands in bold are ones you can run " + (event.isDM ? "here" : "there") + "*\n" +
                "*You can type " + event.precommand + "help [commandName] to get more information on a command.*"
        });

        console.log(embed);

        if (event.isDM) {
            bot.send(event.channelId, { embed });
        } else {
            // is server
            bot.send(event.channelId, "I've sent you some help!");
            bot.sendDM(event.userId, { embed });
        }
    }

    /**
     * Appends the overloads for help
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordMessageEvent} event event
     * @param {String} command command
     */
    _appendHelpOverloads(fields, help, event, command) {
        if (!help.overloads) return;

        for (let overload of help.overloads) {
            let value = [];
            let args = Object.keys(overload);

            for (let argument of args) {
                value.push("**" + argument + "** - " + overload[argument]);
            }

            fields.push({
                name: event.precommand.precommandStr + command + " *" + args.join(" ") + "*",
                value: value.join("\n")
            });
        }
    }

    /**
     * Appends the overloads for help
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordMessageEvent} event event
     */
    _appendHelpExamples(fields, help, event) {
        if (!help.examples) return;

        fields.push({
            name: "**Examples**",
            value: help.examples.map(e =>
                "`" + event.precommand.precommandStr + e[0] + "` - " + e[1] + ""
            ).join("\n")
        });
    }

    /**
     * Creates an help embed object
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordMessageEvent} event event
     * @param {String} command help of command
     * @param {Bot} bot bot
     */
    _createHelpEmbedObject(fields, help, event, command, bot) {
        let title = "**" + event.precommand.precommandStr + command + "**";
        let description = help.description || "The " + command + " command";

        if (help.group) {
            title += " (" + help.group + ")";
        }

        if (help.fromPlugin) {
            description = "_From plugin '" + help.fromPlugin + "'_\n" + description;
        }

        return {
            embed: {
                color: bot.config.themeColor,
                title: title,
                description: description,
                fields: fields
            }
        };
    }

    /**
     * Appends the permissions for a command in help
     * @param {Object[]} fields fields in embed, to append to
     * @param {BotCommandHelp} help help data
     */
    _appendHelpPermissions(fields, help) {
        let requiredPermissionMarkdownStr =
            help.requiredPermission ? "**" + help.requiredPermission + "**" : "none";
        let runInDMMarkdownStr = help.noDM ? "**no**" : "allowed";

        let value =
            "Required permission: " + requiredPermissionMarkdownStr +
            "\nRun in DMs: " + runInDMMarkdownStr;

        fields.push({
            name: "**Permissions**",
            value: value
        });
    }

    /**
     * Sends a help embed about a command
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} command command to get help about
     * @param {BotCommandHelp} help help
     */
    _sendHelpAboutCommand(bot, event, command, help) {
        let fields = [];

        this._appendHelpOverloads(fields, help, event, command);
        this._appendHelpExamples(fields, help, event);
        this._appendHelpPermissions(fields, help);
        let embed = this._createHelpEmbedObject(fields, help, event, command, bot);

        if (event.isDM) {
            bot.send(event.channelId, embed);
        } else {
            // is server
            bot.send(event.channelId, "I've sent you some help!");
            bot.sendDM(event.userId, embed);
        }
    }

    /**
     * Sends help about a single command
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} command name of command to send help of
     */
    _sendSpecificHelp(bot, event, command) {
        let help = bot.getHelp(command);

        if (help) {
            this._sendHelpAboutCommand(bot, event, command, help);
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
            this._sendSpecificHelp(bot, event, cleanArgs);
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
        if (bot.memory.get(bot.memory.createKey.permissions(), bot.memory.createKey.firstAdmin())) {
            if (bot.permission.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                bot.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                bot.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            bot.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            bot.memory.write(bot.memory.createKey.permissions(), bot.memory.createKey.firstAdmin(), event.userId, true);

            bot.permission.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args arguments
     */
    pretend_get(bot, event, args) {
        let tagMatch = args.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            bot.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommand.precommandStr + "help pretend get` for help"
            );
            return;
        }

        let userId = getSnowflakeNum(tagMatch[0]);
        let user = bot.getUser(userId);
        let message = args.slice(tagMatch[0].length).trim();

        if (!user) {
            bot.send(event.channelId, "Could not find user <@" + userId + ">");
            return;
        }

        bot.onMessage({
            author: user,
            // @ts-ignore
            channel: bot.getChannel(event.channelId),
            guild: bot.getServer(event.serverId),
            content: message
        });
    }

    /**
     * Pretends to recieve a message from soneone else
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args arguments
     */
    forward_to(bot, event, args) {
        let tagMatch = args.slice(0, args.match(/\s/).index);

        let channelId = getSnowflakeNum(tagMatch);
        let channel = bot.getChannel(channelId);
        let message = args.slice(tagMatch.length).trim();

        if (!channel) {
            bot.send(event.channelId, "Could not find channel " + channelId);
            return;
        }

        bot.startRecordingMessagesSentToChannel(event.channelId);
        bot.onMessage({
            author: bot.getUser(event.userId),
            // @ts-ignore
            channel: bot.getChannel(event.channelId),
            guild: bot.getServer(event.serverId),
            content: message
        });

        let sentMessages = bot.stopAndFlushSentMessagesRecordedFromChannel(event.channelId);
        for (let message of sentMessages) {
            bot.send(channelId, message);
        }
    }

    /**
     * Sends a message to a channel
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} argString arguments ns, type, action, id, permission
     */
    edit_permission(bot, event, argString) {
        let args = stringToArgs(argString);

        function sendHelp() {
            bot.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommand.precommandStr + "help edit permission` for help"
            );
        }

        if (args.length !== 5) {
            sendHelp();
            return;
        }

        /** Namespace (channel, server, global) */
        let ns = args[0][0].toLowerCase();
        /** Type (user, role) */
        let type = args[1][0].toLowerCase();
        /** Action (add, remove) */
        let action = args[2][0].toLowerCase();
        /** Id of user or role */
        let id = getSnowflakeNum(args[3]);
        /** Permission name */
        let permission = args[4].trim().toUpperCase();

        /** Permissions for assigner */
        let assignerPermissions = this.bot.permission.getPermissions_channel(event.userId, event.serverId, event.channelId);

        // check if can assign permission
        if (
            Permissions.specialCustoms.includes(permission) && // if special permission
            !assignerPermissions.has("BOT_ADMINISTRATOR") // and is not admin
        ) {
            bot.send(event.channelId, "Cannot assign special custom permission");
            return;
        } else if (Permissions.keys.includes(permission)) {
            bot.send(event.channelId, "Cannot assign discord permissions, you must assign them yourself.");
            return;
        }

        if (ns === "c") { // Channel namespace
            if (type === "u") { // Assign to user
                if (!bot.getUser_server(id, event.serverId)) {
                    bot.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permission.editPermissions_user_channel(id, event.channelId, permission, true);
                    bot.send(event.channelId, "Given <@" + id + "> the permission `" + permission + "` in this channel");
                } else if (action === "r") { // remove
                    bot.permission.editPermissions_user_channel(id, event.channelId, permission, false);
                    bot.send(event.channelId, "Removed <@" + id + ">'s permission (`" + permission + "`) from this channel.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // Assign to role
                if (action === "a") { // add
                    bot.permission.editPermissions_role_channel(id, event.channelId, permission, true);
                    bot.send(event.channelId, "Given role <@" + id + "> the permission `" + permission + "` in this channel.");
                } else if (action === "r") { // remove
                    bot.permission.editPermissions_role_channel(id, event.channelId, permission, false);
                    bot.send(event.channelId, "Removed role <@" + id + ">'s permission (`" + permission + "`) from this channel.");
                } else {
                    sendHelp();
                }
            } else {
                sendHelp();
            }
        } else if (ns === "s") { // Server namespace
            if (type === "u") { // Assign to user
                if (!bot.getUser_server(id, event.serverId)) {
                    bot.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permission.editPermissions_user_server(id, event.serverId, permission, true);
                    bot.send(event.channelId, "Given <@" + id + "> the permission `" + permission + "` in this server");
                } else if (action === "r") { // remove
                    bot.permission.editPermissions_user_server(id, event.serverId, permission, false);
                    bot.send(event.channelId, "Removed <@" + id + ">'s permission (`" + permission + "`) from this server.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // Assign to role
                if (action === "a") { // add
                    bot.permission.editPermissions_role_server(id, event.serverId, permission, true);
                    bot.send(event.channelId, "Given role <@" + id + "> the permission `" + permission + "` in this server.");
                } else if (action === "r") { // remove
                    bot.permission.editPermissions_role_server(id, event.serverId, permission, false);
                    bot.send(event.channelId, "Removed role <@" + id + ">'s permission (`" + permission + "`) from this server.");
                } else {
                    sendHelp();
                }
            } else {
                sendHelp();
            }
        } else if (ns === "g") { // Global namespace
            if (!assignerPermissions.has("BOT_ADMINISTRATOR")) {
                bot.send(event.channelId, "You require **`BOT_ADMINISTRATOR`** permissions to assign global permissions");
                return;
            }
            if (type === "u") { // Assign to user
                if (!bot.getUser_server(id, event.serverId)) {
                    bot.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permission.editPermissions_user_global(id, permission, true);
                    bot.send(event.channelId, "Given <@" + id + "> the permission `" + permission + "` everywhere");
                } else if (action === "r") { // remove
                    bot.permission.editPermissions_user_global(id, permission, false);
                    bot.send(event.channelId, "Removed <@" + id + ">'s permission (`" + permission + "`) everywhere.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // Assign to role
                bot.send(event.channelId, "Global roles are not a thing.");
            } else {
                sendHelp();
            }
        } else {
            sendHelp();
        }
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
                color: bot.config.themeColor,
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
            }),
            group: "Testing"
        }));

        this._registerCommand("log message", this.log_message, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Logs the message to the console of the bot's owner's computer with a \"log\" logging level.",
                overloads: [{
                    "message": "Message to log"
                }],
                examples: [
                    ["log something", "\"something\" will be logged"]
                ]
            }),
            group: "Testing"
        }));

        this._registerCommand("pretend get", this.pretend_get, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "The bot will pretend that it recieved a message.",
                overloads: [{
                    "userId": "From user by UserID raw or as a @metion",
                    "message": "The message that it will mention"
                }],
                examples: [
                    ["pretend get <@207890448159735808> !user info", "Will make the bot pretend that the message actually came from <@207890448159735808>."]
                ]
            }),
            group: "Testing"
        }));

        this._registerCommand("forward to", this.forward_to, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "The bot will forward any message from a command to a different channel.",
                overloads: [{
                    "channelId": "ID of channel to forward to",
                    "message": "The bot will pretend to recieve this message, and if it responds, it will forward the message to the channel."
                }],
                examples: [
                    ["forward to 513789011081297921 !echo a", "Will run the command and send the results to the channel with the ID 513789011081297921"]
                ]
            }),
            group: "Communication"
        }));

        this._registerCommand("edit permission", this.edit_permission, new BotCommandOptions({
            requiredPermission: "ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "Edits the permissions of a person or role.",
                overloads: [{
                    "namespace": "Permissions in __c__hannel, __s__erver, or __g__lobal",
                    "type": "For __u__ser or __r__ole",
                    "action": "To __a__dd or __r__emove permission",
                    "id": "Id of role or user",
                    "permission": "Name of permission to add or remove to user or role"
                }],
                examples: [
                    ["edit permission server user add <@207890448159735808> my_permission", "Will give <@207890448159735808> the permission `MY_PERMISSION` in the server."],
                    ["edit permission s u r <@207890448159735808> my_permission", "Will remove my_permission from <@207890448159735808> in the server."]
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
            }),
            group: "Testing"
        }));

        this._registerCommand("ping", this.ping, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Pings the bot and tells you how long it took for the bot to receive the message.",
                examples: [
                    ["ping", "Do you *really* need an example?"]
                ]
            }),
            group: "Testing"
        }));
        this._registerCommand("user info", this.user_info, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Gives you information about the user. (Exposing)",
                overloads: [{
                    "none": "Leave empty, defaulting to yourself"
                }, {
                    "userId": "From user by UserID raw or as a @metion. The bot will show user information about this user",
                }],
                examples: [
                    ["user info", "Will cause the bot to expose you."],
                    ["user info <@207890448159735808>", "Will cause the bot to expose <@207890448159735808>"]
                ]
            }),
            group: "Utils"
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
            }),
            group: "Utils"
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
            }),
            group: "Promotional"
        }));
        this._registerCommand("link", this.link, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            }),
            group: "Promotional"
        }));
        this._registerCommand("code", this.code, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the link to the code repository this bot is running on, you know. In case you want to build a clone of me.",
                examples: [
                    ["code", "Sends the link of the code in the current channel."]
                ]
            }),
            group: "Promotional"
        }));
    }
}

module.exports = Default;