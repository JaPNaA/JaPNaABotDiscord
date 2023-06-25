"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const util_1 = require("util");
const locationKeyCreator_js_1 = __importDefault(require("../main/bot/utils/locationKeyCreator.js"));
const permissions_js_1 = __importDefault(require("../main/types/permissions.js"));
const childProcess = __importStar(require("child_process"));
const japnaabot = __importStar(require("../main/index"));
const getSnowflakeNum_1 = __importDefault(require("../main/utils/getSnowflakeNum"));
const stringToArgs_js_1 = __importDefault(require("../main/utils/str/stringToArgs.js"));
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
const mention_js_1 = __importDefault(require("../main/utils/str/mention.js"));
const fakeMessage_js_1 = __importDefault(require("../main/utils/fakeMessage.js"));
const commandArguments_js_1 = __importDefault(require("../main/bot/command/commandArguments.js"));
const removeFromArray_js_1 = __importDefault(require("../main/utils/removeFromArray.js"));
const actions_js_1 = require("../main/bot/actions/actions.js");
const inlinePromise_js_1 = __importDefault(require("../main/utils/async/inlinePromise.js"));
/**
 * Normal commands every bot shoud have
 */
class Default extends plugin_js_1.default {
    sawUpdateBotWarning;
    constructor(bot) {
        super(bot);
        this.pluginName = "default";
        this.sawUpdateBotWarning = false;
    }
    *ping() {
        return "Pong! Took " + Math.round(this.bot.client.getPing()) + "ms";
    }
    *eval(event) {
        let str = (0, util_1.inspect)(eval(event.arguments));
        return this._JSCodeBlock(str);
    }
    /**
     * Logs a message to the console with a logging level of "log"
     */
    *log_message(event) {
        logger_js_1.default.log(event.arguments);
    }
    async *user_info(event) {
        let userId = event.userId;
        let response = [];
        if (event.arguments) {
            let newUserId = (0, getSnowflakeNum_1.default)(event.arguments);
            if (newUserId) {
                userId = newUserId;
            }
            else {
                yield "**User does not exist.**";
                return;
            }
        }
        let user = await this.bot.client.getUser(userId);
        if (user) {
            let userStr = "Username: " + user.username +
                "\nDiscriminator: " + user.discriminator +
                "\nId: " + user.id +
                "\nAvatar: [" + user.avatar + "](" + user.avatarURL() + ")" +
                (user.banner ?
                    "\nBanner: [" + user.banner + "](" + user.bannerURL() + ")" :
                    "") +
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
                if (!member) {
                    throw new Error("Unknown error");
                }
                let rolesString = (member.roles.cache.size >= 1 ?
                    member.roles.cache.map(role => "**" + role.name.replace(/@/g, "@\u200B") +
                        "** (" + role.id + ")").join(", ") :
                    "none");
                if (rolesString.length > 750) {
                    rolesString = rolesString.slice(0, 750) + "...";
                }
                let userInServerStr = "Roles: " + rolesString +
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
                const permissions = await this.bot.permissions.getPermissions_channel(userId, event.serverId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            }
            else {
                const permissions = this.bot.permissions.getPermissions_global(userId);
                response.push({
                    name: "Global permissions",
                    value: permissions.customToString() + "\n"
                });
            }
            yield {
                embeds: [{
                        color: this.bot.config.themeColor,
                        author: {
                            name: "Information for " + user.username,
                            icon_url: user.avatarURL({ size: 128 }) || undefined
                        },
                        fields: response,
                        timestamp: new Date().toISOString()
                    }]
            };
        }
        else {
            yield "**User does not exist.**";
        }
    }
    /**
     * Converts all commands to a readable format
     * @param bot bot
     * @param event message event data
     * @param commands
     */
    async _commandsToReadable(bot, event, commands) {
        const permissions = await bot.permissions.getPermissions_channel(event.userId, event.serverId, event.channelId);
        return commands.map(command => {
            let name = command.commandName;
            let canRun = true;
            if ((command.requiredDiscordPermission !== undefined &&
                !permissions.hasDiscord(command.requiredDiscordPermission)) || (command.requiredCustomPermission !== undefined &&
                !permissions.hasCustom(command.requiredCustomPermission))) {
                canRun = false;
            }
            if (command.noDM && event.isDM) {
                canRun = false;
            }
            if (canRun) {
                return "**`" + name + "`**";
            }
            else {
                return "`" + name + "`";
            }
        }).join(", ");
    }
    /**
     * Sends general help information (all commands)
     */
    async *_sendGeneralHelp(event) {
        let fields = [];
        let embed = {
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
            yield { embeds: [embed] };
        }
        else {
            // is server
            yield new actions_js_1.ReplyUnimportant("I've sent you some help!");
            yield new actions_js_1.ReplyPrivate({ embeds: [embed] });
        }
    }
    /**
     * Appends the overloads for help in embed
     */
    _appendHelpOverloads(fields, help, event, command) {
        if (!help.overloads) {
            return;
        }
        for (let overload of help.overloads) {
            let value = [];
            let args = Object.keys(overload);
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
    _appendHelpExamples(fields, help, event) {
        if (!help.examples) {
            return;
        }
        const MAX_VALUE_LENGTH = 1024;
        let sectionsCount = 0;
        function addSection(str) {
            fields.push({
                name: "**Examples**" + (sectionsCount ? ` (${sectionsCount + 1})` : ""),
                value: str
            });
            sectionsCount++;
        }
        const strings = help.examples.map(e => "`" + event.precommandName.name + e[0] + "` - " + e[1] + "");
        let buffer = "";
        for (const str of strings) {
            if (buffer.length + str.length > MAX_VALUE_LENGTH) {
                if (buffer) {
                    addSection(buffer);
                    buffer = "";
                }
                else {
                    addSection((0, ellipsisize_js_1.default)(str, MAX_VALUE_LENGTH));
                }
            }
            buffer += str + "\n";
        }
        if (buffer) {
            addSection(buffer);
        }
    }
    /**
     * Creates an help embed object in embed
     */
    _createHelpEmbedObject(fields, help, event, command, bot) {
        let title = "**" + event.precommandName.name + command + "**";
        let description = help.description || "The " + command + " command";
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
    _appendHelpPermissions(fields, help) {
        let requiredDiscordPermissionMarkdown = help.requiredDiscordPermission ? "**" + help.requiredDiscordPermission + "**" : "none";
        let requiredCustomPermissionMarkdown = help.requiredCustomPermission ? "**" + help.requiredCustomPermission + "**" : "none";
        let runInDMMarkdown = help.noDM ? "**no**" : "allowed";
        let value = "Required Discord permission: " + requiredDiscordPermissionMarkdown +
            "\nRequired custom permission: " + requiredCustomPermissionMarkdown +
            "\nRun in DMs: " + runInDMMarkdown;
        fields.push({
            name: "**Permissions**",
            value: value
        });
    }
    /**
     * Sends a help embed about a command
     */
    *_sendHelpAboutCommand(event, command, help) {
        const fields = [];
        this._appendHelpOverloads(fields, help, event, command);
        this._appendHelpExamples(fields, help, event);
        this._appendHelpPermissions(fields, help);
        const message = this._createHelpEmbedObject(fields, help, event, command, this.bot);
        if (event.isDM) {
            yield { embeds: [message] };
        }
        else {
            // is server
            yield new actions_js_1.ReplyUnimportant("I've sent you some help!");
            yield new actions_js_1.ReplyPrivate({ embeds: [message] });
        }
    }
    /**
     * Sends help about a command, checks if the command and command help exists
     */
    *_sendSpecificHelp(event, command) {
        let help = this.bot.defaultPrecommand.commandManager.getHelp(command);
        if (help) {
            yield* this._sendHelpAboutCommand(event, command, help);
        }
        else if (help === undefined) {
            yield new actions_js_1.ReplyUnimportant("Command `" + command + "` doesn't exist");
        }
        else {
            yield new actions_js_1.ReplyUnimportant("Help for command `" + command + "` doesn't exist");
        }
    }
    /**
     * Pretends to recieve a message from soneone else
     */
    async *help(event) {
        let cleanArgs = event.arguments.toLowerCase().trim();
        if (cleanArgs) {
            yield* this._sendSpecificHelp(event, cleanArgs);
        }
        else {
            yield* this._sendGeneralHelp(event);
        }
    }
    /**
     * Sets the bot admin
     */
    *i_am_the_bot_admin(event) {
        if (this.bot.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.firstAdmin())) {
            if (this.bot.permissions.getPermissions_global(event.userId).hasCustom("BOT_ADMINISTRATOR")) {
                yield "Yes. You are the bot admin.";
            }
            else {
                yield "You are not the bot admin.";
            }
            return;
        }
        else {
            yield "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**";
            this.bot.memory.write(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.firstAdmin(), event.userId, true);
            this.bot.permissions.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }
    /**
     * Pretends to recieve a message from soneone else
     */
    async *pretend_get(event) {
        let tagMatch = event.arguments.match(/^\s*<@[!@&]?\d+>\s*/);
        if (!tagMatch) {
            return "Invalid amount of arguments. See `" +
                event.precommandName.name + "help pretend get` for help";
        }
        let userId = (0, getSnowflakeNum_1.default)(tagMatch[0]);
        if (!userId) {
            return "Invalid syntax. See `" + event.precommandName.name + "help pretend get`";
        }
        let user = await this.bot.client.getUser(userId);
        let message = event.arguments.slice(tagMatch[0].length).trim();
        if (!user) {
            return "Could not find user" + (0, mention_js_1.default)(userId);
        }
        let channel = await this.bot.client.getChannel(event.channelId);
        let guild = await this.bot.client.getServer(event.serverId);
        if (!guild) {
            throw new Error("Unknown error");
        }
        this.bot.rawEventAdapter.onMessage((0, fakeMessage_js_1.default)({
            author: user,
            channel: channel,
            guild: guild,
            id: event.messageId,
            content: message
        }));
    }
    /**
     * Pretends to recieve a message from someone else
     */
    async *forward_to(event) {
        let firstWhitespaceMatch = event.arguments.match(/\s/);
        if (!firstWhitespaceMatch) {
            return;
        } // tODO: Tell invalid, get help
        let tagMatch = event.arguments.slice(0, firstWhitespaceMatch.index);
        let channelId = (0, getSnowflakeNum_1.default)(tagMatch);
        if (!channelId) {
            return;
        } // tODO: Tell invalid, get help
        let channel = await this.bot.client.getChannel(channelId);
        let message = event.arguments.slice(tagMatch.length).trim();
        if (!channel) {
            return "Could not find channel " + channelId;
        }
        this.bot.client.sentMessageRecorder.startRecordingMessagesSentToChannel(event.channelId);
        let author = await this.bot.client.getUser(event.userId);
        let guild = await this.bot.client.getServer(event.serverId);
        if (!author || !guild) {
            return; // tODO: Tell invalid, get help
        }
        this.bot.rawEventAdapter.onMessage((0, fakeMessage_js_1.default)({
            author: author,
            channel: channel,
            guild: guild,
            content: message,
            id: event.messageId
        }));
        let sentMessages = this.bot.client.sentMessageRecorder
            .stopAndFlushSentMessagesRecordedFromChannel(event.channelId);
        for (let message of sentMessages) {
            yield new actions_js_1.Send(channelId, message).setSendNotifications();
        }
    }
    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    async *edit_permission(event) {
        const args = (0, stringToArgs_js_1.default)(event.arguments);
        const _bot = this.bot;
        const helpStr = "Invalid arguments. See `" +
            event.precommandName.name + "help edit permission` for help";
        if (args.length !== 5) {
            return helpStr;
        }
        // Arguments pharsing
        /** Namespace (channel, server, global) */
        const ns = args[0][0].toLowerCase();
        /** Type (user, role) */
        const type = args[1][0].toLowerCase();
        /** Action (add, remove) */
        const actionStr = args[2][0].toLowerCase();
        /** Id of user or role */
        const id = (0, getSnowflakeNum_1.default)(args[3]);
        if (!id) {
            return helpStr;
        }
        /** Permission name */
        const permission = args[4].trim().toUpperCase();
        let willHavePermission;
        if (actionStr === 'a') { // add
            willHavePermission = true;
        }
        else if (actionStr === 'r') { // remove
            willHavePermission = false;
        }
        else {
            return helpStr;
        }
        let isAssignUser;
        if (type === 'u') {
            isAssignUser = true;
        }
        else if (type === 'r') {
            isAssignUser = false;
        }
        else {
            return helpStr;
        }
        /** Permissions for assigner */
        const assignerPermissions = await this.bot.permissions.getPermissions_channel(event.userId, event.serverId, event.channelId);
        // check if can assign permission
        if (permissions_js_1.default.specialCustoms.includes(permission) && // if special permission
            !assignerPermissions.hasCustom("BOT_ADMINISTRATOR") // and is not admin
        ) {
            return "Cannot assign special custom permission";
        }
        // check if user exists, if assigning to user
        if (type === "u") {
            if (!await this.bot.client.getMemberFromServer(id, event.serverId)) {
                return "User not found";
            }
        }
        if (ns === "c") { // channel namespace
            if (isAssignUser) { // assign to user
                this.bot.permissions.editPermissions_user_channel(id, event.channelId, permission, willHavePermission);
            }
            else { // assign to role
                this.bot.permissions.editPermissions_role_channel(id, event.channelId, permission, willHavePermission);
            }
        }
        else if (ns === "s") { // server namespace
            if (isAssignUser) { // assign to user
                this.bot.permissions.editPermissions_user_server(id, event.serverId, permission, willHavePermission);
            }
            else { // assign to role
                this.bot.permissions.editPermissions_role_server(id, event.serverId, permission, willHavePermission);
            }
        }
        else if (ns === "g") { // global namespace
            if (!assignerPermissions.hasCustom("BOT_ADMINISTRATOR")) {
                return "You require **`BOT_ADMINISTRATOR`** permissions to assign global permissions";
            }
            if (isAssignUser) { // assign to user
                if (!this.bot.client.getMemberFromServer(id, event.serverId)) {
                    return "User not found";
                }
                this.bot.permissions.editPermissions_user_global(id, permission, willHavePermission);
            }
            else { // assign to role
                return "Global roles are not a thing.";
            }
        }
        else {
            return helpStr;
        }
        // Send confirmation message
        const namespaceStrMap = {
            "c": "this channel",
            "s": "this server",
            "g": "everywhere"
        };
        if (willHavePermission) {
            return "Given " + (0, mention_js_1.default)(id) + " the permission `" + permission + "` in " + namespaceStrMap[ns];
        }
        else {
            return "Removed " + (0, mention_js_1.default)(id) + "'s permission (`" + permission + "`) from " + namespaceStrMap[ns];
        }
    }
    async *configCommand(event) {
        const args = new commandArguments_js_1.default(event.arguments).parse({
            overloads: [
                ["--plugin", "--scope", "--location", "--key", "--value"],
                []
            ],
            namedOptions: [
                ["--plugin", "-p"], ["--scope", "-s"], ["--location", "-l"],
                ["--key", "-k"], ["--value", "-v"], ["--subkey", "-x"]
            ],
            flags: [
                ["--append", "-a"], ["--remove", "-r"]
            ],
            exclusions: [
                ["--subkey", "--append", "--remove"]
            ],
            required: [
                "--plugin", "--scope", "--location"
            ],
            parseQuotes: false,
            allowMultifinal: true
        });
        const locationArg = args.get("--location");
        const scopeChar = args.get("--scope")[0].toLowerCase();
        const key = args.get("--key");
        const valueStr = args.get("--value");
        const plugin = this.bot.pluginManager.getPlugin(args.get("--plugin"));
        if (!plugin) {
            throw new Error("Plugin doesn't exist or isn't loaded");
        }
        const shouldAutoLocation = ["here", "auto"].includes(locationArg.toLowerCase());
        let location = (0, getSnowflakeNum_1.default)(locationArg) || locationArg;
        let humanReadableLocation;
        let config;
        // resolve scope
        if (scopeChar === "c") {
            if (shouldAutoLocation) {
                location = event.channelId;
            }
            // check permissions
            const server = await this.bot.client.getServerFromChannel(location);
            if (!server) {
                throw new Error("Could not find server or channel");
            }
            if (!(await this.bot.permissions.getPermissions_channel(event.userId, server.id, location)).hasDiscord("Administrator")) {
                return "You do not have permission (`Administrator`) to configure that channel";
            }
            humanReadableLocation = `<#${location}>`;
            config = await plugin.config.getAllUserSettingsInChannel(location);
        }
        else if (scopeChar === "s") {
            if (shouldAutoLocation) {
                location = event.serverId;
            }
            // check permissions
            if (!(await this.bot.permissions.getPermissions_channel(event.userId, location, event.channelId)).hasDiscord("Administrator")) {
                return "You do not have permission (`Administrator`) to configure that server";
            }
            config = await plugin.config.getAllUserSettingsInServer(location);
            humanReadableLocation = "server";
        }
        else if (scopeChar === "g") {
            return "Cannot assign global config using this command. Please edit the config file instead.";
        }
        else {
            return "Invalid scope. (channel, server or global)";
        }
        // get key
        if (key) {
            if (!config.has(key)) {
                return "Config option doesn't exist";
            }
            if (["delete", "default", "remove", "reset"].includes(valueStr)) {
                // delete key
                if (scopeChar === "c") {
                    plugin.config.deleteInChannel(location, key);
                }
                else if (scopeChar === "s") {
                    plugin.config.deleteInServer(location, key);
                }
                else {
                    throw new Error("Unknown error");
                }
                return "Deleted key.";
            }
            else if (valueStr) {
                // update key
                let previousValue;
                if (scopeChar === "c") {
                    previousValue = await plugin.config.getInChannel(location, key);
                }
                else if (scopeChar === "s") {
                    previousValue = await plugin.config.getInServer(location, key);
                }
                else {
                    throw new Error("Unknown error");
                }
                // modify value
                let valueArg = JSON.parse(valueStr);
                let value;
                if (args.get("--subkey")) {
                    if (typeof previousValue === "object") {
                        value = this._jsonCopy(previousValue);
                        if (Array.isArray(value)) {
                            const index = parseInt(args.get("--subkey"));
                            if (index in value) {
                                value[index] = valueArg;
                            }
                            else {
                                return "Index out of bounds. (Use the --append flag to add items)";
                            }
                        }
                        else {
                            value[args.get("--subkey")] = valueArg;
                        }
                    }
                    else {
                        return "Cannot access using subkey of non-object";
                    }
                }
                else if (args.get("--append")) {
                    if (!Array.isArray(previousValue)) {
                        return "Current value is not an array";
                    }
                    value = this._jsonCopy(previousValue);
                    value.push(valueArg);
                }
                else if (args.get("--remove")) {
                    if (!Array.isArray(previousValue)) {
                        return "Current value is not an array";
                    }
                    value = this._jsonCopy(previousValue);
                    (0, removeFromArray_js_1.default)(value, valueArg);
                }
                else {
                    if (typeof valueArg !== plugin.config.getUserSettingType(key)) {
                        return "Value type doesn't match schema";
                    }
                    value = valueArg;
                }
                // set value
                if (scopeChar === "c") {
                    await plugin.config.setInChannel(location, key, value);
                }
                else if (scopeChar === "s") {
                    plugin.config.setInServer(location, key, value);
                }
                else {
                    throw new Error("Unknown error");
                }
                return "Updated config.";
            }
            else {
                return `**Config for ${plugin.pluginName} in ${humanReadableLocation}**` +
                    "```js\n" + this._getHumanReadableConfigItemString(key, config.get(key), plugin) + "```";
            }
        }
        else {
            return `**Config for ${plugin.pluginName} in ${humanReadableLocation}**` +
                "```js\n" + this._getHumanReadableConfigString(config, plugin) + "```";
        }
    }
    _jsonCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }
    _getHumanReadableConfigString(config, plugin) {
        const msg = [];
        if (config.size <= 0) {
            return "// No configurable options";
        }
        for (const [key, value] of config) {
            msg.push(this._getHumanReadableConfigItemString(key, value, plugin));
        }
        return msg.join("\n");
    }
    _getHumanReadableConfigItemString(key, value, plugin) {
        return `// ${plugin.userConfigSchema[key].comment}\n` +
            `${key}: ${JSON.stringify(value)}\n`;
    }
    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    *send(event) {
        let whitespaceMatch = event.arguments.match(/\s/);
        if (!whitespaceMatch) {
            return;
        } // tODO: tell invalid, help
        let whitespaceIndex = whitespaceMatch.index;
        if (!whitespaceIndex) {
            throw new Error("Unknown error");
        }
        return new actions_js_1.Send(event.arguments.slice(0, whitespaceIndex), event.arguments.slice(whitespaceIndex + 1)).setSendNotifications();
    }
    /**
     * Sends link to add bot to server
     */
    *link(event) {
        return { embeds: [{
                    color: this.bot.config.themeColor,
                    description: "You can add me to another server with this link:\n" + this.bot.config.addLink
                }] };
    }
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    *code(event) {
        return "You can view my code here:\n" + this.bot.config.gitlabLink;
    }
    /**
     * Updates the bot
     */
    async *update_bot(event) {
        let cleanArgs = event.arguments.trim().toLowerCase();
        if (cleanArgs === "confirm") {
            if (this.sawUpdateBotWarning) {
                yield* this._actuallyUpdateBot(this.bot, event);
                return;
            }
        }
        yield "Confirm updating the bot with `" + event.precommandName.name +
            "update bot confirm`.\n" +
            "**The bot process will exit after the update.**";
        this.sawUpdateBotWarning = true;
    }
    /**
     * Actually updates the bot
     */
    async *_actuallyUpdateBot(bot, event) {
        const childProcessComplete = (0, inlinePromise_js_1.default)();
        childProcess.exec("npm install gitlab:japnaa/japnaabotdiscord", (error, stdout, stderr) => childProcessComplete.res([error, stdout, stderr]));
        const [error, stdout, stderr] = await childProcessComplete.promise;
        if (error) {
            logger_js_1.default.error(error);
            yield "Error updating bot. See logs.";
        }
        else {
            yield "Update successful. Stopping...";
        }
        logger_js_1.default.log(stdout);
        logger_js_1.default.log(stderr);
        this._endBotProcess();
    }
    _endBotProcess() {
        logger_js_1.default.log("Exiting process...");
        japnaabot.stop(10000).then(() => process.exit(0));
    }
    async *uptime(event) {
        const childProcessComplete = (0, inlinePromise_js_1.default)();
        childProcess.exec("uptime", (error, stdout, stderr) => childProcessComplete.res([error, stdout, stderr]));
        const [error, stdout, stderr] = await childProcessComplete.promise;
        if (error) {
            logger_js_1.default.error(error);
            return "Failed to get uptime.";
        }
        else {
            return "```" + stdout + "```";
        }
    }
    _JSCodeBlock(str) {
        const cleanStr = (0, ellipsisize_js_1.default)(str.replace(/ {4}/g, "\t"), 2000 - 9);
        return "```js\n" + cleanStr + "```";
    }
    _start() {
        this._registerDefaultCommand("eval", this.eval, {
            requiredCustomPermission: "BOT_ADMINISTRATOR",
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
            requiredCustomPermission: "BOT_ADMINISTRATOR",
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
            requiredCustomPermission: "BOT_ADMINISTRATOR",
            help: {
                description: "The bot will forward any message from a command to a different channel.",
                overloads: [{
                        "channelId": "ID of channel to forward to",
                        "message": "The bot will pretend to recieve this message, and if it responds, " +
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
            requiredDiscordPermission: "Administrator",
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
                        "[value]": "Optional. JSON or \'delete\'. If provided, edits key.",
                        "--append/-a": "Flag. Appends `value` instead of replacing. Only for array values.",
                        "--remove/-r": "Flag. Removes `value` from the array value.",
                        "--subkey/-x": "Optional. If specified, updates an object value by replacing object[subkey]."
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
                    ],
                    [
                        "config autothread c here autothreadSubscribers --add \"501862082334031883\"",
                        "Adds user with id 501862082334031883 to the autothreadSubscribers array"
                    ],
                    [
                        "config autothread c here autothreadSubscribers --remove \"501862082334031883\"",
                        "Removes user with id 501862082334031883 to the autothreadSubscribers array"
                    ],
                    [
                        "config autothread c here autothreadSubscribers --subkey 0 \"501862082334031883\"",
                        "Replaces the first user in the autothreadSubscribers array to 501862082334031883"
                    ]
                ]
            },
            requiredDiscordPermission: "Administrator"
        });
        this._registerDefaultCommand("send", this.send, {
            requiredCustomPermission: "BOT_ADMINISTRATOR",
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
                description: "Sends the link to the code repository this bot is running on, you know. " +
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
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });
        this._registerDefaultCommand("uptime", this.uptime, {
            help: {
                description: "Tells you how long the computer on which JaPNaABot runs on has been up for"
            },
            group: "Other"
        });
    }
    _stop() {
        // do nothing
    }
}
exports.default = Default;
