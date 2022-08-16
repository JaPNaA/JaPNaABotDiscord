import Bot from "../main/bot/bot/bot";
import CommandArguments from "../main/bot/command/commandArguments";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import getSnowflakeNum from "../main/utils/getSnowflakeNum";
import toOne from "../main/utils/toOne";

const SCROLL_EMOJI = "\ud83d\udcdc";

export default class ReactionRoles extends BotPlugin {
    private messageReactionRoleMap: {
        [x: string]: {
            rollId: string,
            reactionEmoji: string
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "reactionRoles";
        this.messageReactionRoleMap = this.bot.memory.get(this.pluginName, "messageReactionRollMap") || {};
    }

    public async createReactionRoll(event: DiscordCommandEvent) {
        const args = new CommandArguments(event.arguments).parse({
            overloads: [["roll", "emoji"], ["emoji", "roll"]],
            required: ["roll"],
            check: {
                "roll": /(^\d+$)|(<@&\d+>)/,
                "emoji": emoji => !(/<@&\d+>/.test(emoji))
            }
        });

        const emoji = args.get("emoji") || SCROLL_EMOJI;
        const rollId = getSnowflakeNum(args.get("roll"));
        if (!rollId) {
            this.bot.client.send(event.channelId, "Please specify a roll via mention.");
            return;
        }

        const server = await this.bot.client.getServer(event.serverId);
        if (!server) { throw new Error("Must run in server."); }
        const self = await this.bot.client.getMemberFromServer(this.bot.client.id!, event.serverId);
        if (!self) { throw new Error("Bot not in server"); }
        if (server.roles.comparePositions(self.roles.highest, rollId) <= 0) {
            throw new Error("Cannot assign roll higher than bot's highest roll");
        }

        const sender = await this.bot.client.getMemberFromServer(event.userId, event.serverId);
        if (!sender) { throw new Error("Sender not in server"); }
        if (server.roles.comparePositions(sender.roles.highest, rollId) <= 0) {
            throw new Error("Cannot assign roll higher than your highest roll");
        }

        const message = toOne(await this.bot.client.send(event.channelId, {
            content: `React with ${emoji} to get the <@&${rollId}> roll.`,
            allowedMentions: { users: [] }
        }));

        this.messageReactionRoleMap[message.id] = {
            rollId: rollId,
            reactionEmoji: emoji
        };

        // bot reacts to own message; switches to error message if can't react
        let success = false;
        try {
            await message.react(emoji);
            success = true;
        } catch (err: any) {
            if (err.name === "DiscordAPIError") {
                message.edit(`Error: ${emoji} is not a reactable emoji.`);
            }
            delete this.messageReactionRoleMap[message.id];
        }

        if (success) {
            this.writeMemory();

            // delete command message
            const channel = await this.bot.client.getChannel(event.channelId);
            if (channel?.isText()) {
                channel.messages.fetch(event.messageId)
                    .then(message => message.delete())
                    .catch(_ => { });
            }
        }
    }

    public _start(): void {
        this.bot.client.client.on("messageReactionAdd", async (reaction, user) => {
            const reactionRoll = this.messageReactionRoleMap[reaction.message.id];
            if (!reactionRoll) { return; }
            if (user.bot) { return; }
            if (!this.isSameEmoji(reactionRoll.reactionEmoji, reaction.emoji)) {
                await reaction.remove();
                return;
            }
            const member = await this.getMemberFromChannel(user.id, reaction.message.channelId);
            if (!member) { return; }
            await member.roles.add(reactionRoll.rollId);
        });

        this.bot.client.client.on("messageReactionRemove", async (reaction, user) => {
            const reactionRoll = this.messageReactionRoleMap[reaction.message.id];
            if (!reactionRoll) { return; }
            if (user.bot) { return; }
            if (!this.isSameEmoji(reactionRoll.reactionEmoji, reaction.emoji)) { return; }
            const member = await this.getMemberFromChannel(user.id, reaction.message.channelId);
            if (!member) { return; }
            await member.roles.remove(reactionRoll.rollId);
        });

        this.bot.client.client.on("messageDelete", message => {
            if (message.id in this.messageReactionRoleMap) {
                delete this.messageReactionRoleMap[message.id];
            }
            this.writeMemory();
        });

        this._registerDefaultCommand("create reaction roll", this.createReactionRoll, {
            help: {
                description: "Creates a message that assigns a roll upon reaction"
            }
        });
    }

    private async getMemberFromChannel(userId: string, channelId: string) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) { return; }
        const member = await this.bot.client.getMemberFromServer(userId, server.id);
        return member;
    }

    private isSameEmoji(aText: string, reactionEmoji: { name: string | null, id: string | null }) {
        if (reactionEmoji.id) {
            const snowflake = getSnowflakeNum(aText);
            if (!snowflake) { return false; }
            return snowflake === reactionEmoji.id;
        } else {
            return aText === reactionEmoji.name;
        }
    }

    private writeMemory() {
        this.bot.memory.write(this.pluginName, "messageReactionRollMap", this.messageReactionRoleMap);
    }

    public _stop(): void { }
}
