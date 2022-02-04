import BotPlugin from "../main/bot/plugin/plugin.js";
import Logger from "../main/utils/logger.js";

import { inspect } from "util";

import createKey from "../main/bot/utils/locationKeyCreator.js";
import Permissions from "../main/types/permissions.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotCommand from "../main/bot/command/command.js";
import { EmbedFieldData, TextChannel } from "discord.js";

import * as childProcess from "child_process";
import * as japnaabot from "../main/index";
import getSnowflakeNum from "../main/utils/getSnowflakeNum";
import stringToArgs from "../main/utils/str/stringToArgs.js";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import mention from "../main/utils/str/mention.js";
import fakeMessage from "../main/utils/fakeMessage.js";
import Bot from "../main/bot/bot/bot.js";
import { BotCommandHelp, BotCommandHelpFull } from "../main/bot/command/commandHelp.js";

/**
 * Normal commands every bot shoud have
 */
class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "default";
        this.sawUpdateBotWarning = false;
    }

    ping(event: DiscordCommandEvent): void {
        this.bot.client.send(event.channelId, "Pong! Took " + Math.round(this.bot.client.getPing()) + "ms"); // * should be using abstraction
    }

    eval(event: DiscordCommandEvent): void {
        let str: string = inspect(eval(event.arguments));
        this._sendJSCodeBlock(event.channelId, str);
    }

    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(event: DiscordCommandEvent): void {
        Logger.log(event.arguments);
    }

    async user_info(event: DiscordCommandEvent) {
        let userId: string | null = event.userId;

        let response: EmbedFieldData[] = [];

        if (event.arguments) {
            let newUserId: string | null = getSnowflakeNum(event.arguments);
            if (newUserId) {
                userId = newUserId;
            } else {
                this.bot.client.send(event.channelId, "**User does not exist.**");
                return;
            }
        }

        let user = await this.bot.client.getUser(userId);

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
                let member = await this.bot.client.getMemberFromServer(userId, event.serverId);
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

                const permissions: Permissions = await this.bot.permissions.getPermissions_channel(userId, event.serverId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            } else {
                const permissions: Permissions = this.bot.permissions.getPermissions_global(userId);
                response.push({
                    name: "Global permissions",
                    value: permissions.customToString() + "\n"
                });
            }


            this.bot.client.sendEmbed(event.channelId, {
                color: this.bot.config.themeColor,
                author: {
                    name: "Information for " + user.username,
                    icon_url: user.avatarURL({ size: 128 }) || undefined
                },
                fields: response,
                timestamp: new Date()
            });
        } else {
            this.bot.client.send(event.channelId, "**User does not exist.**");
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
    async _sendGeneralHelp(event: DiscordCommandEvent) {
        let fields: { [s: string]: string; }[] = [];
        let embed: object = {
            color: this.bot.config.themeColor,
            title: "All Commands",
            fields: fields
        };

        for (let [groupName, commands] of this.bot.defaultPrecommand.commandManager.commandGroups) {
            fields.push({
                name: groupName || "Other",
                value: await this._commandsToReadable(this.bot, event, commands)
            });
        }

        fields.push({
            name: "---",
            value: "*Any commands in bold are ones you can run " + (event.isDM ? "here" : "there") + "*\n" +
                "*You can type " + event.precommandName.precommand + "help [commandName] to get more information on a command.*"
        });

        if (event.isDM) {
            this.bot.client.sendEmbed(event.channelId, embed);
        } else {
            // is server
            this.bot.client.send(event.channelId, "I've sent you some help!");
            this.bot.client.sendDM(event.userId, { embeds: [embed] });
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
    _createHelpEmbedObject(fields: object[], help: BotCommandHelpFull, event: DiscordCommandEvent, command: string, bot: Bot): object {
        let title: string = "**" + event.precommandName.name + command + "**";
        let description: string = help.description || "The " + command + " command";

        if (help.group) {
            title += " (" + help.group + ")";
        }

        if (help.fromPlugin) {
            description = "_From plugin '" + help.fromPlugin + "'_\n" + description;
        }

        return {
            color: bot.config.themeColor,
            title: title,
            description: description,
            fields: fields
        };
    }

    /**
     * Appends the permissions for a command in help in embed
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelpFull): void {
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
    _sendHelpAboutCommand(event: DiscordCommandEvent, command: string, help: BotCommandHelpFull): void {
        const fields: object[] = [];

        this._appendHelpOverloads(fields, help, event, command);
        this._appendHelpExamples(fields, help, event);
        this._appendHelpPermissions(fields, help);
        const message: object = this._createHelpEmbedObject(fields, help, event, command, this.bot);

        if (event.isDM) {
            this.bot.client.sendEmbed(event.channelId, message);
        } else {
            // is server
            this.bot.client.send(event.channelId, "I've sent you some help!");
            this.bot.client.sendDM(event.userId, { embeds: [message] });
        }
    }

    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(event: DiscordCommandEvent, command: string): void {
        let help: BotCommandHelpFull | null | undefined = this.bot.defaultPrecommand.commandManager.getHelp(command);

        if (help) {
            this._sendHelpAboutCommand(event, command, help);
        } else if (help === undefined) {
            this.bot.client.send(event.channelId, "Command `" + command + "` doesn't exist");
        } else {
            this.bot.client.send(event.channelId, "Help for command `" + command + "` doesn't exist");
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     */
    help(event: DiscordCommandEvent): void {
        let cleanArgs: string = event.arguments.toLowerCase().trim();

        if (cleanArgs) {
            this._sendSpecificHelp(event, cleanArgs);
        } else {
            this._sendGeneralHelp(event);
        }
    }

    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(event: DiscordCommandEvent): void {
        if (this.bot.memory.get(createKey.permissions(), createKey.firstAdmin())) {
            if (this.bot.permissions.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                this.bot.client.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                this.bot.client.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            this.bot.client.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            this.bot.memory.write(createKey.permissions(), createKey.firstAdmin(), event.userId, true);

            this.bot.permissions.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     */
    async pretend_get(event: DiscordCommandEvent) {
        let tagMatch: RegExpMatchArray | null = event.arguments.match(/^\s*<@[!@&]]?\d+>\s*/);

        if (!tagMatch) {
            this.bot.client.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommandName.name + "help pretend get` for help"
            );
            return;
        }

        let userId: string | null = getSnowflakeNum(tagMatch[0]);
        if (!userId) {
            this.bot.client.send(event.channelId, "Invalid syntax. See `" + event.precommandName.name + "help pretend get`");
            return;
        }
        let user = await this.bot.client.getUser(userId);
        let message: string = event.arguments.slice(tagMatch[0].length).trim();

        if (!user) {
            this.bot.client.send(event.channelId, "Could not find user" + mention(userId));
            return;
        }

        let channel = await this.bot.client.getChannel(event.channelId);
        let guild = await this.bot.client.getServer(event.serverId);

        if (!guild) { throw new Error("Unknown error"); }

        this.bot.rawEventAdapter.onMessage(fakeMessage({
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
    async forward_to(event: DiscordCommandEvent) {
        let firstWhitespaceMatch: RegExpMatchArray | null = event.arguments.match(/\s/);
        if (!firstWhitespaceMatch) { return; } // tODO: Tell invalid, get help
        let tagMatch: string = event.arguments.slice(0, firstWhitespaceMatch.index);

        let channelId: string | null = getSnowflakeNum(tagMatch);
        if (!channelId) { return; } // tODO: Tell invalid, get help
        let channel = await this.bot.client.getChannel(channelId) as TextChannel;
        let message: string = event.arguments.slice(tagMatch.length).trim();

        if (!channel) {
            this.bot.client.send(event.channelId, "Could not find channel " + channelId);
            return;
        }

        this.bot.client.sentMessageRecorder.startRecordingMessagesSentToChannel(event.channelId);

        let author = await this.bot.client.getUser(event.userId);
        let guild = await this.bot.client.getServer(event.serverId);

        if (!author || !guild) {
            return; // tODO: Tell invalid, get help
        }

        this.bot.rawEventAdapter.onMessage(fakeMessage({
            author: author,
            channel: channel,
            guild: guild,
            content: message,
            id: event.messageId
        }));

        let sentMessages: object[] = this.bot.client.sentMessageRecorder
            .stopAndFlushSentMessagesRecordedFromChannel(event.channelId);
        for (let message of sentMessages) {
            this.bot.client.send(channelId, message);
        }
    }

    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    async edit_permission(event: DiscordCommandEvent) {
        const args: string[] = stringToArgs(event.arguments);
        const _bot = this.bot;

        function sendHelp(): void {
            _bot.client.send(event.channelId,
                "Invalid arguments. See `" +
                event.precommandName.name + "help edit permission` for help"
            );
        }

        if (args.length !== 5) {
            sendHelp();
            return;
        }

        // Arguments pharsing

        /** Namespace (channel, server, global) */
        const ns: string = args[0][0].toLowerCase();
        /** Type (user, role) */
        const type: string = args[1][0].toLowerCase();
        /** Action (add, remove) */
        const actionStr: string = args[2][0].toLowerCase();
        /** Id of user or role */
        const id = getSnowflakeNum(args[3]);
        if (!id) { sendHelp(); return; }
        /** Permission name */
        const permission: string = args[4].trim().toUpperCase();

        let willHavePermission: boolean;
        if (actionStr === 'a') { // add
            willHavePermission = true;
        } else if (actionStr === 'r') { // remove
            willHavePermission = false;
        } else {
            sendHelp();
            return;
        }

        let isAssignUser: boolean;
        if (type === 'u') {
            isAssignUser = true;
        } else if (type === 'r') {
            isAssignUser = false;
        } else {
            sendHelp();
            return;
        }

        /** Permissions for assigner */
        const assignerPermissions = await this.bot.permissions.getPermissions_channel(event.userId, event.serverId, event.channelId);

        // check if can assign permission
        if (
            Permissions.specialCustoms.includes(permission) && // if special permission
            !assignerPermissions.has("BOT_ADMINISTRATOR") // and is not admin
        ) {
            this.bot.client.send(event.channelId, "Cannot assign special custom permission");
            return;
        } else if (Permissions.keys.includes(permission)) {
            this.bot.client.send(event.channelId, "Cannot assign discord permissions, you must assign them yourself.");
            return;
        }

        // check if user exists, if assigning to user
        if (type === "u") {
            if (!await this.bot.client.getMemberFromServer(id, event.serverId)) {
                this.bot.client.send(event.channelId, "User not found");
                return;
            }
        }

        if (ns === "c") { // channel namespace
            if (isAssignUser) { // assign to user
                this.bot.permissions.editPermissions_user_channel(id, event.channelId, permission, willHavePermission);
            } else { // assign to role
                this.bot.permissions.editPermissions_role_channel(id, event.channelId, permission, willHavePermission);
            }
        } else if (ns === "s") { // server namespace
            if (isAssignUser) { // assign to user
                this.bot.permissions.editPermissions_user_server(id, event.serverId, permission, willHavePermission);
            } else { // assign to role
                this.bot.permissions.editPermissions_role_server(id, event.serverId, permission, willHavePermission);
            }
        } else if (ns === "g") { // global namespace
            if (!assignerPermissions.has("BOT_ADMINISTRATOR")) {
                this.bot.client.send(event.channelId, "You require **`BOT_ADMINISTRATOR`** permissions to assign global permissions");
                return;
            }
            if (isAssignUser) { // assign to user
                if (!this.bot.client.getMemberFromServer(id, event.serverId)) {
                    this.bot.client.send(event.channelId, "User not found");
                    return;
                }
                this.bot.permissions.editPermissions_user_global(id, permission, willHavePermission);
            } else { // assign to role
                this.bot.client.send(event.channelId, "Global roles are not a thing.");
                return;
            }
        } else {
            sendHelp();
            return;
        }

        // Send confirmation message

        const namespaceStrMap: { [x: string]: string } = {
            "c": "this channel",
            "s": "this server",
            "g": "everywhere"
        }

        if (willHavePermission) {
            this.bot.client.send(event.channelId, "Given " + mention(id) + " the permission `" + permission + "` in " + namespaceStrMap[ns]);
        } else {
            this.bot.client.send(event.channelId, "Removed " + mention(id) + "'s permission (`" + permission + "`) from " + namespaceStrMap[ns]);
        }
    }

    async configCommand(event: DiscordCommandEvent) {
        const args = stringToArgs(event.arguments);
        const [pluginArg, scope, locationArg, key, ...valueArr] = args;
        const valueStr = valueArr.join(" ");

        if (!pluginArg || !scope || !locationArg) {
            throw new Error("Invalid arguments");
        }

        const plugin = this.bot.pluginManager.getPlugin(pluginArg);
        if (!plugin) { throw new Error("Plugin doesn't exist or isn't loaded"); }

        const shouldAutoLocation = ["here", "auto"].includes(locationArg.toLowerCase());
        let location = getSnowflakeNum(locationArg) || locationArg;
        let humanReadableLocation;

        let config: Map<string, any>;

        if (scope[0] === "c") {
            if (shouldAutoLocation) { location = event.channelId; }

            // check permissions
            const server = await this.bot.client.getServerFromChannel(location);
            if (!server) { throw new Error("Could not find server or channel"); }
            if (!(await this.bot.permissions.getPermissions_channel(
                event.userId, server.id, location)).has("ADMINISTRATOR")
            ) {
                throw new Error("You do not have permission (`ADMINISTRATOR`) to configure that channel");
            }

            humanReadableLocation = `<#${location}>`;
            config = await plugin.config.getAllUserSettingsInChannel(location);
        } else if (scope[0] === "s") {
            if (shouldAutoLocation) { location = event.serverId; }

            // check permissions
            if (!(await this.bot.permissions.getPermissions_channel(
                event.userId, location, event.channelId)).has("ADMINISTRATOR")
            ) {
                throw new Error("You do not have permission (`ADMINISTRATOR`) to configure that server");
            }

            config = await plugin.config.getAllUserSettingsInServer(location);
            humanReadableLocation = "server";
        } else if (scope[0] === "g") {
            throw new Error("Cannot assign global config using this command. Please edit the config file instead.");
        } else {
            throw new Error("Invalid scope. (channel, server or global)");
        }

        if (key) {
            if (!config.has(key)) {
                throw new Error("Config option doesn't exist");
            }

            if (["delete", "default", "remove", "reset"].includes(valueStr)) {
                if (scope[0] === "c") {
                    plugin.config.deleteInChannel(location, key);
                } else if (scope[0] === "s") {
                    plugin.config.deleteInServer(location, key);
                } else { throw new Error("Unknown error"); }

                this.bot.client.send(
                    event.channelId, "Deleted key."
                );
            } else if (valueStr) {
                const value = JSON.parse(valueStr);
                if (typeof value !== plugin.config.getUserSettingType(key)) {
                    throw new Error("Value type doesn't match schema");
                }

                if (scope[0] === "c") {
                    plugin.config.setInChannel(location, key, value);
                } else if (scope[0] === "s") {
                    plugin.config.setInServer(location, key, value);
                } else { throw new Error("Unknown error"); }
                this.bot.client.send(
                    event.channelId, "Updated config."
                );
            } else {
                this.bot.client.send(event.channelId,
                    `**Config for ${plugin.pluginName} in ${humanReadableLocation}**` +
                    "```js\n" + this._getHumanReadableConfigItemString(key, config.get(key), plugin) + "```"
                );
            }
        } else {
            this.bot.client.send(event.channelId,
                `**Config for ${plugin.pluginName} in ${humanReadableLocation}**` +
                "```js\n" + this._getHumanReadableConfigString(config, plugin) + "```"
            );
        }
    }

    private _getHumanReadableConfigString(config: Map<string, any>, plugin: BotPlugin) {
        const msg = [];

        for (const [key, value] of config) {
            msg.push(this._getHumanReadableConfigItemString(key, value, plugin));
        }

        return msg.join("\n");
    }

    private _getHumanReadableConfigItemString(key: string, value: any, plugin: BotPlugin) {
        return `// ${plugin.userConfigSchema[key].comment}\n` +
            `${key}: ${JSON.stringify(value)}\n`;
    }

    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(event: DiscordCommandEvent): void {
        let whitespaceMatch: RegExpMatchArray | null = event.arguments.match(/\s/);
        if (!whitespaceMatch) { return; } // tODO: tell invalid, help
        let whitespaceIndex: number | undefined = whitespaceMatch.index;
        if (!whitespaceIndex) { throw new Error("Unknown error"); }

        this.bot.client.send(event.arguments.slice(0, whitespaceIndex), event.arguments.slice(whitespaceIndex + 1));
    }

    /**
     * Sends link to add bot to server
     */
    link(event: DiscordCommandEvent): void {
        this.bot.client.sendEmbed(event.channelId, {
            color: this.bot.config.themeColor,
            description: "You can add me to another server with this link:\n" + this.bot.config.addLink
        });
    }

    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(event: DiscordCommandEvent): void {
        this.bot.client.send(event.channelId, "You can view my code here:\n" + this.bot.config.gitlabLink);
    }

    /**
     * Updates the bot
     */
    update_bot(event: DiscordCommandEvent) {
        let cleanArgs = event.arguments.trim().toLowerCase();

        if (cleanArgs === "confirm") {
            if (this.sawUpdateBotWarning) {
                this._actuallyUpdateBot(this.bot, event);
                return;
            }
        }

        this.bot.client.send(event.channelId,
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

        async function callback(this: Default, error: childProcess.ExecException | null, stdout: string, stderr: string) {
            if (error) {
                Logger.error(error);
                await this.bot.client.send(event.channelId, "Error updating bot. See logs.");
            } else {
                await this.bot.client.send(event.channelId, "Update successful. Stopping...");
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

    uptime(event: DiscordCommandEvent) {
        childProcess.exec(
            "uptime",
            (error: childProcess.ExecException | null, stdout: string, stderr: string) => {
                if (error) {
                    Logger.error(error);
                    this.bot.client.send(event.channelId, "Failed to get uptime.");
                } else {
                    this.bot.client.send(event.channelId, "```" + stdout + "```");
                }
            }
        );
    }

    private _sendJSCodeBlock(channelId: string, str: string) {
        const cleanStr = ellipsisize(str.replace(/ {4}/g, "\t"), 2000 - 9);
        this.bot.client.send(channelId, "```js\n" + cleanStr + "```");
    }

    _start(): void {
        this._registerDefaultCommand("eval", this.eval, {
            requiredPermission: "BOT_ADMINISTRATOR",
            help: {
                description: "Evaluates the arguments as JavaScript.",
                overloads: [{
                    "code": "Code to evaluate"
                }],
                examples: [
                    ["eval 1 + 1", "Will give you the result of 1 + 1 (2)"],
                    ["eval bot", "Will give you the entire bot object in JS"]
                ]
            },
            group: "Testing"
        });

        this._registerDefaultCommand("log message", this.log_message, {
            help: {
                description: "Logs the message to the console of the bot's owner's computer with a \"log\" logging level.",
                overloads: [{
                    "message": "Message to log"
                }],
                examples: [
                    ["log something", "\"something\" will be logged"]
                ]
            },
            group: "Testing"
        });

        this._registerDefaultCommand("pretend get", this.pretend_get, {
            requiredPermission: "BOT_ADMINISTRATOR",
            help: {
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
            },
            group: "Testing"
        });

        this._registerDefaultCommand("forward to", this.forward_to, {
            requiredPermission: "BOT_ADMINISTRATOR",
            help: {
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
            },
            group: "Communication"
        });

        this._registerDefaultCommand("edit permission", this.edit_permission, {
            requiredPermission: "ADMINISTRATOR",
            help: {
                description: "Edits the permissions of a person or role.",
                overloads: [{
                    "scope": "Permissions in __c__hannel, __s__erver, or __g__lobal",
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
            }
        });

        this._registerDefaultCommand("config", this.configCommand, {
            help: {
                description: "Configure the bot's plugin",
                overloads: [{
                    "plugin": "Name of plugin",
                    "scope": "Configure in __c__hannel, __s__erver, or __g__lobal",
                    "location": "Channel or server",
                    "[key]": "Optional. Specify a key to view or edit",
                    "[value]": "Optional. JSON or \'delete\'. If provided, edits key."
                }],
                examples: [
                    [
                        "config japnaa s here",
                        "View the config for 'japnaa' plugin in current server"
                    ],
                    [
                        "config autothread c 677722352360095744",
                        "View the config for 'autothread' plugin in the channel with id 677722352360095744. Note: you can use channel mentions for id (ex. #general)"
                    ],
                    [
                        "config japnaa s here spam.limit",
                        "View the spam limit config for plugin 'japnaa' in current server"
                    ],
                    [
                        "config japnaa s here spam.limit 0",
                        "Sets the spam limit config for plugin 'japnaa' in current server to 0"
                    ],
                    [
                        "config autothread c here noThreadKeyword delete",
                        "Reset the noThreadKeyword config for plugin autothread to it's default value. (May be inherited from server or globals)"
                    ]
                ]
            },
            requiredPermission: "ADMINISTRATOR"
        });

        this._registerDefaultCommand("send", this.send, {
            requiredPermission: "BOT_ADMINISTRATOR",
            help: {
                description: "Makes the bot send a message to a specified channel.",
                overloads: [{
                    "channelId": "ID of channel. The bot must be in this channel.",
                    "message": "The message that the bot will send in that channel."
                }],
                examples: [
                    ["send 501917691565572118 hi", "Will send a message to the channel with the ID 501917691565572118 a friendly \"hi\""]
                ]
            },
            group: "Testing"
        });

        this._registerDefaultCommand("ping", this.ping, {
            help: {
                description: "Pings the bot and tells you how long it took for the bot to receive the message.",
                examples: [
                    ["ping", "Do you *really* need an example?"]
                ]
            },
            group: "Testing"
        });
        this._registerDefaultCommand("user info", this.user_info, {
            help: {
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
            },
            group: "Utils"
        });
        this._registerDefaultCommand("help", this.help, {
            help: {
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
            },
            group: "Utils"
        });

        this._registerDefaultCommand("i am the bot admin", this.i_am_the_bot_admin, {
            help: {
                description: "The first person to run this command will become the bot admin. No one afterwards can become the bot admin.",
                examples: [
                    ["i am the bot admin", "Makes you the bot admin (if you're first)"]
                ]
            }
        });

        this._registerDefaultCommand("invite", this.link, {
            help: {
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            },
            group: "Promotional"
        });
        this._registerDefaultCommand("link", this.link, {
            help: {
                description: "Sends the invite link in current channel.",
                examples: [
                    ["invite", "Sends the invite link in the current channel. Wait! I just said that!"]
                ]
            },
            group: "Promotional"
        });
        this._registerDefaultCommand("code", this.code, {
            help: {
                description:
                    "Sends the link to the code repository this bot is running on, you know. " +
                    "In case you want to build a clone of me.",
                examples: [
                    ["code", "Sends the link of the code in the current channel."]
                ]
            },
            group: "Promotional"
        });

        this._registerDefaultCommand("update bot", this.update_bot, {
            help: {
                description: "Updates the 'japnaabot' node module to the newest version"
            },
            group: "Other",
            requiredPermission: "BOT_ADMINISTRATOR"
        });

        this._registerDefaultCommand("uptime", this.uptime, {
            help: {
                description: "Tells you how long the computer on which JaPNaABot runs on has been up for"
            },
            group: "Other"
        });
    }

    _stop(): void {
        // do nothing
    }
}

export default Default;