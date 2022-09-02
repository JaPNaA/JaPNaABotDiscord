"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("../main/bot/actions/actions");
const commandArguments_1 = __importDefault(require("../main/bot/command/commandArguments"));
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const getSnowflakeNum_1 = __importDefault(require("../main/utils/getSnowflakeNum"));
const SCROLL_EMOJI = "\ud83d\udcdc";
class ReactionRoles extends plugin_1.default {
    messageReactionRoleMap;
    constructor(bot) {
        super(bot);
        this.pluginName = "reactionRoles";
        this.messageReactionRoleMap = this.bot.memory.get(this.pluginName, "messageReactionRollMap") || {};
    }
    async *createReactionRoll(event) {
        const args = new commandArguments_1.default(event.arguments).parse({
            overloads: [["roll", "emoji"], ["emoji", "roll"]],
            required: ["roll"],
            check: {
                "roll": /(^\d+$)|(<@&\d+>)/,
                "emoji": emoji => !(/<@&\d+>/.test(emoji))
            }
        });
        const emoji = args.get("emoji") || SCROLL_EMOJI;
        const rollId = (0, getSnowflakeNum_1.default)(args.get("roll"));
        if (!rollId) {
            return "Please specify a roll via mention.";
        }
        const server = await this.bot.client.getServer(event.serverId);
        if (!server) {
            throw new Error("Must run in server.");
        }
        const self = await this.bot.client.getMemberFromServer(this.bot.client.id, event.serverId);
        if (!self) {
            throw new Error("Bot not in server");
        }
        if (server.roles.comparePositions(self.roles.highest, rollId) <= 0) {
            return "Bot cannot assign roll higher than bot's highest roll";
        }
        const sender = await this.bot.client.getMemberFromServer(event.userId, event.serverId);
        if (!sender) {
            throw new Error("Sender not in server");
        }
        if (server.roles.comparePositions(sender.roles.highest, rollId) <= 0) {
            return "You cannot assign roll higher than your highest roll";
        }
        const reply = new actions_1.ReplySoft({
            content: `React with ${emoji} to get the <@&${rollId}> roll.`,
            allowedMentions: { users: [] }
        });
        yield reply;
        const message = reply.getMessage();
        this.messageReactionRoleMap[message.id] = {
            rollId: rollId,
            reactionEmoji: emoji
        };
        // bot reacts to own message; switches to error message if can't react
        let success = false;
        try {
            await message.react(emoji);
            success = true;
        }
        catch (err) {
            if (err.name === "DiscordAPIError") {
                message.edit(`Error: ${emoji} is not a reactable emoji.`);
            }
            delete this.messageReactionRoleMap[message.id];
        }
        if (success) {
            this.writeMemory();
            yield new actions_1.DeleteMessageSoft(event.channelId, event.messageId);
        }
    }
    _start() {
        this.bot.client.client.on("messageReactionAdd", async (reaction, user) => {
            const reactionRoll = this.messageReactionRoleMap[reaction.message.id];
            if (!reactionRoll) {
                return;
            }
            if (user.bot) {
                return;
            }
            if (!this.isSameEmoji(reactionRoll.reactionEmoji, reaction.emoji)) {
                await reaction.remove();
                return;
            }
            const member = await this.getMemberFromChannel(user.id, reaction.message.channelId);
            if (!member) {
                return;
            }
            await member.roles.add(reactionRoll.rollId);
        });
        this.bot.client.client.on("messageReactionRemove", async (reaction, user) => {
            const reactionRoll = this.messageReactionRoleMap[reaction.message.id];
            if (!reactionRoll) {
                return;
            }
            if (user.bot) {
                return;
            }
            if (!this.isSameEmoji(reactionRoll.reactionEmoji, reaction.emoji)) {
                return;
            }
            const member = await this.getMemberFromChannel(user.id, reaction.message.channelId);
            if (!member) {
                return;
            }
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
                description: "Creates a message that assigns a roll upon reaction",
                overloads: [{
                        "<roll>": "The roll to give",
                        "<emoji>": "Optional. The emoji users click"
                    }],
                examples: [
                    ["create reaction roll @myRoll", "Reacting allows users to get `myRoll`"],
                    ["create reaction roll @myRoll :poop:", "Reacting with :poop: gives users `myRoll`"]
                ]
            }
        });
    }
    async getMemberFromChannel(userId, channelId) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) {
            return;
        }
        const member = await this.bot.client.getMemberFromServer(userId, server.id);
        return member;
    }
    isSameEmoji(aText, reactionEmoji) {
        if (reactionEmoji.id) {
            const snowflake = (0, getSnowflakeNum_1.default)(aText);
            if (!snowflake) {
                return false;
            }
            return snowflake === reactionEmoji.id;
        }
        else {
            return aText === reactionEmoji.name;
        }
    }
    writeMemory() {
        this.bot.memory.write(this.pluginName, "messageReactionRollMap", this.messageReactionRoleMap);
    }
    _stop() { }
}
exports.default = ReactionRoles;
