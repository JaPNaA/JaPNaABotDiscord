"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const builders_1 = require("@discordjs/builders");
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
const precommand_js_1 = require("../main/bot/precommand/precommand.js");
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
class SlashCommands extends plugin_js_1.default {
    precommand = new precommand_js_1.PrecommandWithCallback(this.bot, ["/"], () => { });
    constructor(bot) {
        super(bot);
        this.pluginName = "japnaaweird";
    }
    async _start() {
        await this.bot.events.ready.promise();
        const slashCommands = [];
        for (const command of this.bot.defaultPrecommand.commandManager.commands) {
            const slashCommand = new builders_1.SlashCommandBuilder()
                .setName(command.commandName.replace(/\s/g, "_"));
            if (command.help) {
                slashCommand.setDescription((0, ellipsisize_js_1.default)(command.help.description, 100));
            }
            else {
                slashCommand.setDescription("The '" + command.commandName + "' command.");
            }
            slashCommand.addStringOption(op => op.setName("args").setDescription("Command arguments"));
            slashCommands.push(slashCommand.toJSON());
        }
        const rest = new rest_1.REST({ version: '9' }).setToken(this.bot.client.client.token);
        rest.put(v9_1.Routes.applicationCommands(this.bot.client.id), {
            body: slashCommands
        }).catch(err => console.log(err));
        this.bot.client.client.on("interactionCreate", async (interaction) => {
            if (interaction.isCommand()) {
                if (!interaction.member) {
                    return;
                }
                const matchingCommand = this.findMatchingCommand(interaction.commandName);
                if (!matchingCommand) {
                    interaction.reply({
                        ephemeral: true,
                        content: "Error: command not found"
                    });
                    return;
                }
                try {
                    const event = {
                        username: interaction.user.username,
                        userId: interaction.user.id,
                        channelId: interaction.channelId,
                        serverId: interaction.guildId || "",
                        messageId: interaction.id,
                        message: "",
                        commandContent: "",
                        createdTimestamp: interaction.createdTimestamp,
                        isDM: !interaction.guildId,
                        arguments: interaction.options.getString("args") || "",
                        originalEvent: {
                            author: (await this.bot.client.getUser(interaction.member.user.id)),
                            channel: (await this.bot.client.getChannel(interaction.channelId)),
                            content: "",
                            guild: (await this.bot.client.getServer(interaction.guildId)),
                            id: interaction.id,
                            createdTimestamp: interaction.createdTimestamp
                        },
                        precommandName: {
                            precommand: this.precommand,
                            index: 0,
                            name: "/"
                        }
                    };
                    const gen = matchingCommand.tryRunCommandGenerator(event);
                    for await (const action of gen) {
                        await action.performInteraction(this.bot, interaction);
                    }
                    if (!interaction.replied) {
                        interaction.reply({
                            content: "Ok", ephemeral: true
                        });
                    }
                }
                catch (err) {
                    logger_js_1.default.error(err);
                }
            }
        });
    }
    findMatchingCommand(commandName) {
        for (const command of this.bot.defaultPrecommand.commandManager.commands) {
            if (this.cleanCommandName(command.commandName) === this.cleanCommandName(commandName)) {
                return command;
            }
        }
        return null;
    }
    strReplaceSpaces(str) {
        return str.replace(/\s/g, "_");
    }
    cleanCommandName(str) {
        return this.strReplaceSpaces(str).toLowerCase();
    }
    _stop() {
        // do nothing
    }
}
exports.default = SlashCommands;
