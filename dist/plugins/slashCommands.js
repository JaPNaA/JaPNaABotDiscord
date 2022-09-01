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
const fakeMessage_js_1 = __importDefault(require("../main/utils/fakeMessage.js"));
class SlashCommands extends plugin_js_1.default {
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
                interaction.reply("Ok");
                this.bot.rawEventAdapter.onMessage((0, fakeMessage_js_1.default)({
                    author: (await this.bot.client.getUser(interaction.member.user.id)),
                    channel: (await this.bot.client.getChannel(interaction.channelId)),
                    content: this.bot.precommandManager.precommands[0].names[0] + interaction.commandName.replace(/_/g, " ") + " " + (interaction.options.getString("args") || ""),
                    guild: (await this.bot.client.getServer(interaction.guildId)),
                    id: interaction.id
                }));
            }
        });
    }
    _stop() {
        // do nothing
    }
}
exports.default = SlashCommands;
