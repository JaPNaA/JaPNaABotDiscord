import BotPlugin from "../main/bot/plugin/plugin.js";
import BotCommandOptions from "../main/bot/command/commandOptions.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import Logger from "../main/utils/logger.js";

import { inspect } from "util";

import createKey from "../main/bot/utils/locationKeyCreator.js";
import Permissions from "../main/types/permissions.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotCommand from "../main/bot/command/command.js";
import { TextChannel } from "discord.js";

import * as childProcess from "child_process";
import * as japnaabot from "../main/index";
import getSnowflakeNum from "../main/utils/getSnowflakeNum";
import stringToArgs from "../main/utils/str/stringToArgs.js";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import mention from "../main/utils/str/mention.js";
import fakeMessage from "../main/utils/fakeMessage.js";
import Bot from "../main/bot/bot/bot.js";

/**
 * Normal commands every bot shoud have
 */
class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;

    constructor(bot: Bot) {
        super(bot);
        this._pluginName = "default";
        this.sawUpdateBotWarning = false;
    }

    ping(bot: Bot, event: DiscordCommandEvent): void {
        bot.client.send(event.channelId, "Pong! Took " + Math.round(bot.client.getPing()) + "ms"); // * should be using abstraction
    }

    eval(bot: Bot, event: DiscordCommandEvent, args: string): void {
        let str: string = inspect(eval(args));
        str = ellipsisize(str.replace(/ {4}/g, "\t"), 1994);
        bot.client.send(event.channelId, "```" + str + "```");
    }

    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(bot: Bot, event: DiscordCommandEvent, args: string): void {
        Logger.log(args);
    }

    async user_info(bot: Bot, event: DiscordCommandEvent, args: string) {
        let userId: string | null = event.userId;

        let response: { [s: string]: string; }[] = [];

        if (args) {
            let newUserId: string | null = getSnowflakeNum(args);
            if (newUserId) {
                userId = newUserId;
            } else {
                bot.client.send(event.channelId, "**User does not exist.**");
                return;
            }
        }

        let user = await bot.client.getUser(userId);

        if (user) {
            let userStr: string =
                "Username: " + user.username +
                "\nDiscriminator: " + user.discriminator +
                "\nId: " + user.id +
                "\nAvatar: [" + user.avatar + "](" + user.avatarURL() + ")" +
                (user.banner ?
                    "\nBanner: [" + user.banner + "](" + user.bannerURL() + ")" :
                    ""
                ) +
                "\nAccent color:" + user.accentColor +
                "\nCreated: " + user.createdAt.toLocaleString() +
                "\nFlags: " + user.flags?.bitfield +
                "\nBot: " + user.bot;

            response.push({
                name: "User info",
                value: userStr + "\n"
            });

            if (!event.isDM) {
                let member = await bot.client.getMemberFromServer(userId, event.serverId);
                if (!member) { throw new Error("Unknown error"); }

                let rolesString: string = (
                    member.roles.cache.size >= 1 ?
                        member.roles.cache.map(
                            role =>
                                "**" + role.name.replace(/@/g, "@\u200B") +
                                "** (" + role.id + ")"
                        ).join(", ") :
                        "none"
                );

                if (rolesString.length > 750) {
                    rolesString = rolesString.slice(0, 750) + "...";
                }

                let userInServerStr: string =
                    "Roles: " + rolesString +
                    "\nIs mute: " + (member.voice.selfMute ? "Yes" : "No") +
                    "\nIs deaf: " + (member.voice.selfDeaf ? "Yes" : "No") +
                    "\nId: " + member.id +
                    "\nJoined: " + member.joinedAt +
                    "\nStatus: " + member.presence?.status +
                    "\nNick: " + member.nickname +
                    "\nVoice Channel Id: " + member.voice.channelId;

                response.push({
                    name: "User of server info",
                    value: userInServerStr + "\n"
                });

                const permissions: Permissions = await bot.permissions.getPermissions_channel(userId, event.serverId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            } else {
                const permissions: Permissions = bot.permissions.getPermissions_global(userId);
                response.push({
                    name: "Global permissions",
                    value: permissions.customToString() + "\n"
                });
            }


            bot.client.send(event.channelId, {
                embeds: [{
                    color: bot.config.themeColor,
                    author: {
                        name: "Information for " + user.username,
                        icon_url: user.avatarURL({ size: 128 })
                    },
                    fields: response,
                    timestamp: new Date()
                }]
            });
        } else {
            bot.client.send(event.channelId, "**User does not exist.**");
        }
    }

    /**
     * Converts all commands to a readable format
     * @param bot bot
     * @param event message event data
     * @param commands
     */
    async _commandsToReadable(bot: Bot, event: DiscordCommandEvent, commands: BotCommand[]): Promise<string> {
        const permissions = await bot.permissions.getPermissions_channel(event.userId, event.serverId, event.channelId);
        return commands.map(command => {
            let name: string = command.commandName;
            let canRun: boolean = true;

            if (
                command.requiredPermission !== undefined &&
                !permissions.has(command.requiredPermission)
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
     * Sends general help information (all commands)
     */
    async _sendGeneralHelp(bot: Bot, event: DiscordCommandEvent) {
        let fields: { [s: string]: string; }[] = [];
        let embed: object = {
            color: bot.config.themeColor,
            title: "All Commands",
            fields: fields
        };

        for (let [groupName, commands] of bot.defaultPrecommand.commandManager.commandGroups) {
            fields.push({
                name: groupName || "Other",
                value: await this._commandsToReadable(bot, event, commands)
            });
        }

        fields.push({
            name: "---",
            value: "*Any commands in bold are ones you can run " + (event.isDM ? "here" : "there") + "*\n" +
                "*You can type " + event.precommandName.precommand + "help [commandName] to get more information on a command.*"
        });

        if (event.isDM) {
            bot.client.send(event.channelId, { embeds: [embed] });
        } else {
            // is server
            bot.client.send(event.channelId, "I've sent you some help!");
            bot.client.sendDM(event.userId, { embeds: [embed] });
        }
    }

    /**
     * Appends the overloads for help in embed
     */
    _appendHelpOverloads(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string): void {
        if (!help.overloads) { return; }

        for (let overload of help.overloads) {
            let value: string[] = [];
            let args: string[] = Object.keys(overload);

            for (let argument of args) {
                value.push("**" + argument + "** - " + overload[argument]);
            }

            fields.push({
                name: event.precommandName.name + command + " *" + args.join(" ") + "*",
                value: value.join("\n")
            });
        }
    }

    /**
     * Appends the overloads for help in embed
     */
    _appendHelpExamples(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent): void {
        if (!help.examples) { return; }

        fields.push({
            name: "**Examples**",
            value: help.examples.map(e =>
                "`" + event.precommandName.name + e[0] + "` - " + e[1] + ""
            ).join("\n")
        });
    }

    /**
     * Creates an help embed object in embed
     */
    _createHelpEmbedObject(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string, bot: Bot): object {
        let title: string = "**" + event.precommandName.name + command + "**";
        let description: string = help.description || "The " + command + " command";

        if (help.group) {
            title += " (" + help.group + ")";
        }

        if (help.fromPlugin) {
            description = "_From plugin '" + help.fromPlugin + "'_\n" + description;
        }

        return {
            embeds: [{
                color: bot.config.themeColor,
                title: title,
                description: description,
                fields: fields
            }]
        };
    }

    /**
     * Appends the permissions for a command in help in embed
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelp): void {
        let requiredPermissionMarkdown: string =
            help.requiredPermission ? "**" + help.requiredPermission + "**" : "none";
        let runInDMMarkdown: string = help.noDM ? "**no**" : "allowed";

        let value: string =
            "Required permission: " + requiredPermissionMarkdown +
            "\nRun in DMs: " + runInDMMarkdown;

        fields.push({
            name: "**Permissions**",
            value: value
        });
    }

    /**
     * Sends a help embed about a command
     */
    _sendHelpAboutCommand(bot: Bot, event: DiscordCommandEvent, command: string, help: BotCommandHelp): void {
        const fields: object[] = [];

        this._appendHelpOverloads(fields, help, event, command);
        this._appendHelpExamples(fields, help, event);
        this._appendHelpPermissions(fields, help);
        const message: object = this._createHelpEmbedObject(fields, help, event, command, bot);

        if (event.isDM) {
            bot.client.send(event.channelId, message);
        } else {
            // is server
            bot.client.send(event.channelId, "I've sent you some help!");
            bot.client.sendDM(event.userId, message);
        }
    }

    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(bot: Bot, event: DiscordCommandEvent, command: string): void {
        let help: BotCommandHelp | null | undefined = bot.defaultPrecommand.commandManager.getHelp(command);

        if (help) {
            this._sendHelpAboutCommand(bot, event, command, help);
        } else if (help === undefined) {
            bot.client.send(event.channelId, "Command `" + command + "` doesn't exist");
        } else {
            bot.client.send(event.channelId, "Help for command `" + command + "` doesn't exist");
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     */
    help(bot: Bot, event: DiscordCommandEvent, args: string): void {
        let cleanArgs: string = args.toLowerCase().trim();

        if (cleanArgs) {
            this._sendSpecificHelp(bot, event, cleanArgs);
        } else {
            this._sendGeneralHelp(bot, event);
        }
    }

    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(bot: Bot, event: DiscordCommandEvent): void {
        if (bot.memory.get(createKey.permissions(), createKey.firstAdmin())) {
            if (bot.permissions.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                bot.client.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                bot.client.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            bot.client.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            bot.memory.write(createKey.permissions(), createKey.firstAdmin(), event.userId, true);

            bot.permissions.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     */
    async pretend_get(bot: Bot, event: DiscordCommandEvent, args: string) {
        let tagMatch: RegExpMatchArray | null = args.match(/^\s*<@[!@&]]?\d+>\s*/);

        if (!tagMatch) {
            bot.client.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommandName.name + "help pretend get` for help"
            );
            return;
        }

        let userId: string | null = getSnowflakeNum(tagMatch[0]);
        if (!userId) {
            bot.client.send(event.channelId, "Invalid syntax. See `" + event.precommandName.name + "help pretend get`");
            return;
        }
        let user = await bot.client.getUser(userId);
        let message: string = args.slice(tagMatch[0].length).trim();

        if (!user) {
            bot.client.send(event.channelId, "Could not find user" + mention(userId));
            return;
        }

        let channel = await bot.client.getChannel(event.channelId);
        let guild = await bot.client.getServer(event.serverId);

        if (!guild) { throw new Error("Unknown error"); }

        bot.rawEventAdapter.onMessage(fakeMessage({
            author: user,
            channel: channel as TextChannel,
            guild: guild,
            id: event.messageId,
            content: message
        }));
    }

    /**
     * Pretends to recieve a message from someone else
     */
    async forward_to(bot: Bot, event: DiscordCommandEvent, args: string) {
        let firstWhitespaceMatch: RegExpMatchArray | null = args.match(/\s/);
        if (!firstWhitespaceMatch) { return; } // tODO: Tell invalid, get help
        let tagMatch: string = args.slice(0, firstWhitespaceMatch.index);

        let channelId: string | null = getSnowflakeNum(tagMatch);
        if (!channelId) { return; } // tODO: Tell invalid, get help
        let channel = await bot.client.getChannel(channelId) as TextChannel;
        let message: string = args.slice(tagMatch.length).trim();

        if (!channel) {
            bot.client.send(event.channelId, "Could not find channel " + channelId);
            return;
        }

        bot.client.sentMessageRecorder.startRecordingMessagesSentToChannel(event.channelId);

        let author = await bot.client.getUser(event.userId);
        let guild = await bot.client.getServer(event.serverId);

        if (!author || !guild) {
            return; // tODO: Tell invalid, get help
        }

        bot.rawEventAdapter.onMessage(fakeMessage({
            author: author,
            channel: channel,
            guild: guild,
            content: message,
            id: event.messageId
        }));

        let sentMessages: object[] = bot.client.sentMessageRecorder
            .stopAndFlushSentMessagesRecordedFromChannel(event.channelId);
        for (let message of sentMessages) {
            bot.client.send(channelId, message);
        }
    }

    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    async edit_permission(bot: Bot, event: DiscordCommandEvent, argString: string) {
        let args: string[] = stringToArgs(argString);

        function sendHelp(): void {
            bot.client.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommandName.name + "help edit permission` for help"
            );
        }

        if (args.length !== 5) {
            sendHelp();
            return;
        }

        /** Namespace (channel, server, global) */
        let ns: string = args[0][0].toLowerCase();
        /** Type (user, role) */
        let type: string = args[1][0].toLowerCase();
        /** Action (add, remove) */
        let action: string = args[2][0].toLowerCase();
        /** Id of user or role */
        let id: string | null = getSnowflakeNum(args[3]);
        if (!id) { return; } // tODO: tell invalid, get help
        /** Permission name */
        let permission: string = args[4].trim().toUpperCase();

        /** Permissions for assigner */
        let assignerPermissions = await bot.permissions.getPermissions_channel(event.userId, event.serverId, event.channelId);

        // check if can assign permission
        if (
            Permissions.specialCustoms.includes(permission) && // if special permission
            !assignerPermissions.has("BOT_ADMINISTRATOR") // and is not admin
        ) {
            bot.client.send(event.channelId, "Cannot assign special custom permission");
            return;
        } else if (Permissions.keys.includes(permission)) {
            bot.client.send(event.channelId, "Cannot assign discord permissions, you must assign them yourself.");
            return;
        }

        if (ns === "c") { // channel namespace
            if (type === "u") { // assign to user
                if (!bot.client.getMemberFromServer(id, event.serverId)) {
                    bot.client.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permissions.editPermissions_user_channel(id, event.channelId, permission, true);
                    bot.client.send(event.channelId, "Given" + mention(id) + " the permission `" + permission + "` in this channel");
                } else if (action === "r") { // remove
                    bot.permissions.editPermissions_user_channel(id, event.channelId, permission, false);
                    bot.client.send(event.channelId, "Removed" + mention(id) + "'s permission (`" + permission + "`) from this channel.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // assign to role
                if (action === "a") { // add
                    bot.permissions.editPermissions_role_channel(id, event.channelId, permission, true);
                    bot.client.send(event.channelId, "Given role" + mention(id) + " the permission `" + permission + "` in this channel.");
                } else if (action === "r") { // remove
                    bot.permissions.editPermissions_role_channel(id, event.channelId, permission, false);
                    bot.client.send(event.channelId, "Removed role" + mention(id) + "'s permission (`" + permission + "`) from this channel.");
                } else {
                    sendHelp();
                }
            } else {
                sendHelp();
            }
        } else if (ns === "s") { // server namespace
            if (type === "u") { // assign to user
                if (!bot.client.getMemberFromServer(id, event.serverId)) {
                    bot.client.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permissions.editPermissions_user_server(id, event.serverId, permission, true);
                    bot.client.send(event.channelId, "Given" + mention(id) + " the permission `" + permission + "` in this server");
                } else if (action === "r") { // remove
                    bot.permissions.editPermissions_user_server(id, event.serverId, permission, false);
                    bot.client.send(event.channelId, "Removed" + mention(id) + "'s permission (`" + permission + "`) from this server.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // assign to role
                if (action === "a") { // add
                    bot.permissions.editPermissions_role_server(id, event.serverId, permission, true);
                    bot.client.send(event.channelId, "Given role" + mention(id) + " the permission `" + permission + "` in this server.");
                } else if (action === "r") { // remove
                    bot.permissions.editPermissions_role_server(id, event.serverId, permission, false);
                    bot.client.send(event.channelId, "Removed role" + mention(id) + "'s permission (`" + permission + "`) from this server.");
                } else {
                    sendHelp();
                }
            } else {
                sendHelp();
            }
        } else if (ns === "g") { // global namespace
            if (!assignerPermissions.has("BOT_ADMINISTRATOR")) {
                bot.client.send(event.channelId, "You require **`BOT_ADMINISTRATOR`** permissions to assign global permissions");
                return;
            }
            if (type === "u") { // assign to user
                if (!bot.client.getMemberFromServer(id, event.serverId)) {
                    bot.client.send(event.channelId, "User not found");
                    return;
                }
                if (action === "a") { // add
                    bot.permissions.editPermissions_user_global(id, permission, true);
                    bot.client.send(event.channelId, "Given" + mention(id) + " the permission `" + permission + "` everywhere");
                } else if (action === "r") { // remove
                    bot.permissions.editPermissions_user_global(id, permission, false);
                    bot.client.send(event.channelId, "Removed" + mention(id) + "'s permission (`" + permission + "`) everywhere.");
                } else {
                    sendHelp();
                }
            } else if (type === "r") { // assign to role
                bot.client.send(event.channelId, "Global roles are not a thing.");
            } else {
                sendHelp();
            }
        } else {
            sendHelp();
        }
    }

    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(bot: Bot, event: DiscordCommandEvent, args: string): void {
        let whitespaceMatch: RegExpMatchArray | null = args.match(/\s/);
        if (!whitespaceMatch) { return; } // tODO: tell invalid, help
        let whitespaceIndex: number | undefined = whitespaceMatch.index;
        if (!whitespaceIndex) { throw new Error("Unknown error"); }

        bot.client.send(args.slice(0, whitespaceIndex), args.slice(whitespaceIndex + 1));
    }

    /**
     * Sends link to add bot to server
     */
    link(bot: Bot, event: DiscordCommandEvent): void {
        bot.client.send(event.channelId, {
            embed: {
                color: bot.config.themeColor,
                description: "You can add me to another server with this link:\n" + bot.config.addLink
            }
        });
    }

    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(bot: Bot, event: DiscordCommandEvent): void {
        bot.client.send(event.channelId, "You can view my code here:\n" + bot.config.gitlabLink);
    }

    /**
     * Updates the bot
     */
    update_bot(bot: Bot, event: DiscordCommandEvent, args: string) {
        let cleanArgs = args.trim().toLowerCase();

        if (cleanArgs === "confirm") {
            if (this.sawUpdateBotWarning) {
                this._actuallyUpdateBot(bot, event);
                return;
            }
        }

        bot.client.send(event.channelId,
            "Confirm updating the bot with `" + event.precommandName.name +
            "update bot confirm`.\n" +
            "**The bot process will exit after the update.**"
        );

        this.sawUpdateBotWarning = true;
    }

    /**
     * Actually updates the bot
     */
    _actuallyUpdateBot(bot: Bot, event: DiscordCommandEvent) {
        childProcess.exec(
            "npm install gitlab:japnaa/japnaabotdiscord",
            callback.bind(this)
        );

        function callback(this: Default, error: childProcess.ExecException | null, stdout: string, stderr: string) {
            if (error) {
                Logger.error(error);
                bot.client.send(event.channelId, "Error updating bot. See logs.");
            } else {
                bot.client.send(event.channelId, "Update successful. Stopping...");
            }

            Logger.log(stdout);
            Logger.log(stderr);
            this._endBotProcess();
        }
    }

    _endBotProcess() {
        Logger.log("Exiting process...");
        japnaabot.stop(10000).then(() => process.exit(0));
    }

    uptime(bot: Bot, event: DiscordCommandEvent, args: string) {
        childProcess.exec(
            "uptime",
            function (error: childProcess.ExecException | null, stdout: string, stderr: string) {
                if (error) {
                    Logger.error(error);
                    bot.client.send(event.channelId, "Failed to get uptime.");
                } else {
                    bot.client.send(event.channelId, "```" + stdout + "```");
                }
            }
        );
    }

    _start(): void {
        this._registerDefaultCommand("eval", this.eval, new BotCommandOptions({
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

        this._registerDefaultCommand("log message", this.log_message, new BotCommandOptions({
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

        this._registerDefaultCommand("pretend get", this.pretend_get, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "The bot will pretend that it recieved a message.",
                overloads: [{
                    "userId": "From user by UserID raw or as a @metion",
                    "message": "The message that it will mention"
                }],
                examples: [
                    [
                        "pretend get <@207890448159735808> !user info",
                        "Will make the bot pretend that the message actually came from <@207890448159735808>."
                    ]
                ]
            }),
            group: "Testing"
        }));

        this._registerDefaultCommand("forward to", this.forward_to, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR",
            help: new BotCommandHelp({
                description: "The bot will forward any message from a command to a different channel.",
                overloads: [{
                    "channelId": "ID of channel to forward to",
                    "message":
                        "The bot will pretend to recieve this message, and if it responds, " +
                        "it will forward the message to the channel."
                }],
                examples: [
                    [
                        "forward to 513789011081297921 !echo a",
                        "Will run the command and send the results to the channel with the ID 513789011081297921"
                    ]
                ]
            }),
            group: "Communication"
        }));

        this._registerDefaultCommand("edit permission", this.edit_permission, new BotCommandOptions({
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
                    [
                        "edit permission server user add <@207890448159735808> my_permission",
                        "Will give <@207890448159735808> the permission `MY_PERMISSION` in the server."
                    ], [
                        "edit permission s u r <@207890448159735808> my_permission",
                        "Will remove my_permission from <@207890448159735808> in the server."
                    ]
                ]
            })
        }));

        this._registerDefaultCommand("send", this.send, new BotCommandOptions({
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

        this._registerDefaultCommand("ping", this.ping, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Pings the bot and tells you how long it took for the bot to receive the message.",
                examples: [
                    ["ping", "Do you *really* need an example?"]
                ]
            }),
            group: "Testing"
        }));
        this._registerDefaultCommand("user info", this.user_info, new BotCommandOptions({
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
        this._registerDefaultCommand("help", this.help, new BotCommandOptions({
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

        this._registerDefaultCommand("i am the bot admin", this.i_am_the_bot_admin, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "The first person to run this command will become the bot admin. No one afterwards can become the bot admin.",
                examples: [
                    ["i am the bot admin", "Makes you the bot admin (if you're first)"]
                ]
            })
        }));

        this._registerDefaultCommand("invite", this.link, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            }),
            group: "Promotional"
        }));
        this._registerDefaultCommand("link", this.link, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            }),
            group: "Promotional"
        }));
        this._registerDefaultCommand("code", this.code, new BotCommandOptions({
            help: new BotCommandHelp({
                description:
                    "Sends the link to the code repository this bot is running on, you know. " +
                    "In case you want to build a clone of me.",
                examples: [
                    ["code", "Sends the link of the code in the current channel."]
                ]
            }),
            group: "Promotional"
        }));

        this._registerDefaultCommand("update bot", this.update_bot, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Updates the 'japnaabot' node module to the newest version"
            }),
            group: "Other"
        }));

        this._registerDefaultCommand("uptime", this.uptime, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Tells you how long the computer on which JaPNaABot runs on has been up for"
            }),
            group: "Other"
        }));
    }

    _stop(): void {
        // do nothing
    }
}

export default Default;