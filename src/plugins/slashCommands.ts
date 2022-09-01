import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import fakeMessage from "../main/utils/fakeMessage.js";
import { TextBasedChannel } from "discord.js";

export default class SlashCommands extends BotPlugin {
    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "japnaaweird";
    }

    async _start() {
        await this.bot.events.ready.promise();

        const slashCommands = [];

        for (const command of this.bot.defaultPrecommand.commandManager.commands) {
            const slashCommand = new SlashCommandBuilder()
                .setName(command.commandName.replace(/\s/g, "_"));
            if (command.help) {
                slashCommand.setDescription(ellipsisize(command.help.description, 100));
            } else {
                slashCommand.setDescription("The '" + command.commandName + "' command.");
            }
            slashCommand.addStringOption(op => op.setName("args").setDescription("Command arguments"));
            slashCommands.push(slashCommand.toJSON());
        }

        const rest = new REST({ version: '9' }).setToken(this.bot.client.client.token!);
        rest.put(
            Routes.applicationCommands(this.bot.client.id!),
            {
                body: slashCommands
            }
        ).catch(err => console.log(err));

        this.bot.client.client.on("interactionCreate", async interaction => {
            if (interaction.isCommand()) {
                if (!interaction.member) { return; }
                interaction.reply("Ok");
                this.bot.rawEventAdapter.onMessage(fakeMessage({
                    author: (await this.bot.client.getUser(interaction.member.user.id))!,
                    channel: (await this.bot.client.getChannel(interaction.channelId)) as TextBasedChannel,
                    content: this.bot.precommandManager.precommands[0].names[0] + interaction.commandName.replace(/_/g, " ") + " " + (interaction.options.getString("args") || ""),
                    guild: (await this.bot.client.getServer(interaction.guildId!))!,
                    id: interaction.id
                }));
            }
        });
    }

    _stop(): void {
        // do nothing
    }
}
