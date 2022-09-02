import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import { TextBasedChannel } from "discord.js";
import { PrecommandWithCallback } from "../main/bot/precommand/precommand.js";
import { ReplySoft } from "../main/bot/actions/actions.js";
import Logger from "../main/utils/logger.js";

export default class SlashCommands extends BotPlugin {
    private precommand = new PrecommandWithCallback(this.bot, ["/"], () => { });

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
                            author: (await this.bot.client.getUser(interaction.member.user.id))!,
                            channel: (await this.bot.client.getChannel(interaction.channelId)) as TextBasedChannel,
                            content: "",
                            guild: (await this.bot.client.getServer(interaction.guildId!))!,
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

                    // prevent 'error' response
                    if (!interaction.replied) {
                        interaction.reply({
                            content: "Ok", ephemeral: true
                        });
                    }
                } catch (err) {
                    Logger.error(err);
                }
            }
        });
    }

    private findMatchingCommand(commandName: string) {
        for (const command of this.bot.defaultPrecommand.commandManager.commands) {
            if (this.cleanCommandName(command.commandName) === this.cleanCommandName(commandName)) {
                return command;
            }
        }
        return null;
    }

    private strReplaceSpaces(str: string) {
        return str.replace(/\s/g, "_");
    }

    private cleanCommandName(str: string) {
        return this.strReplaceSpaces(str).toLowerCase();
    }

    _stop(): void {
        // do nothing
    }
}
