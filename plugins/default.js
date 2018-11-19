const BotPlugin = require("../src/plugin.js");
const BotCommandOptions = require("../src/botcommandOptions.js");
const { toUserId } = require("../src/utils.js");
const { inspect } = require("util");

/**
 * @typedef {import("../src/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../src/bot.js")} Bot
 */

/**
 * Normal commands every bot shoud have
 */
class Default extends BotPlugin {
    constructor(bot) {
        super(bot);
    }

    /**
     * ping bot
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    ping(bot, event) {
        let now = new Date();
        let then = new Date(event.wsevent.d.timestamp);
        bot.send(event.channelId, "Pong! Took " + (now.getTime() - then.getTime()) + "ms");
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
     * get user info
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args userId
     */
    userinfo(bot, event, args) {
        let userId = event.userId;

        /** @type {Object.<String, String>[]} */
        let response = [];

        if (args) {
            let newUserId = toUserId(args);
            if (newUserId) {
                userId = newUserId;
            } else {
                bot.send(event.channelId, "**User does not exist.**");
                return;
            }
        }

        let user = bot.getUser(userId);

        if (user) {
            let avatarUrl = "https://cdn.discordapp.com/avatars/" + userId + "/" + user.avatar + ".png";

            let userStr = 
                "Username: " + user.username +
                "\nDiscriminator: " + user.discriminator +
                "\nId: " + user.id + 
                "\nAvatar: [" + user.avatar + "](" + avatarUrl + ")" +
                "\nBot: " + user.bot +
                "\nGame: " + JSON.stringify(user.game);

            response.push({
                name: "User info",
                value: userStr + "\n"
            });

            if (bot.getChannel(event.channelId)) {
                let userInServer = bot.getUser_channel(userId, event.channelId);
                let userInServerStr = 
                    "Roles: " + (userInServer.roles.length >= 1 ? userInServer.roles.join(", ") : "none") + 
                    "\nIs mute: " + (userInServer.mute ? "Yes" : "No") +
                    "\nIs deaf: " + (userInServer.deaf ? "Yes" : "No") +
                    "\nId: " + userInServer.id + 
                    "\nJoined: " + userInServer.joined_at +
                    "\nStatus: " + userInServer.status +
                    "\nNick: " + userInServer.nick +
                    "\nVoice Channel Id: " + userInServer.voice_channel_id;

                response.push({
                    name: "User of server info",
                    value: userInServerStr + "\n"
                });
    
                const permissions = bot.getPermissions_channel(userId, event.channelId);
                response.push({
                    name: "Permissions here",
                    value: permissions.toString() + "\n"
                });
            }

            bot.send(event.channelId, {
                embed: {
                    color: 0xF2495D,
                    author: {
                        name: "Information for " + user.username,
                        icon_url: avatarUrl + "?size=32"
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
     * Sets the bot admin
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    i_am_the_bot_admin(bot, event) {
        if (bot.recall(bot.permissionsNamespace, bot.permissionsAdmin)) {
            if (bot.recall(bot.permissionsNamespace, bot.permissionsAdmin) === event.userId) {
                bot.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                bot.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            bot.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            bot.remember(bot.permissionsNamespace, bot.permissionsAdmin, event.userId, true);

            bot.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
    }

    /**
     * Pretends to recieve a message from soneone else
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message evetn
     * @param {String} args arguments
     */
    pretendget(bot, event, args) {
        let tagMatch = args.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            bot.send(event.channelId, "<insert help message>");
            return;
        }

        let userId = toUserId(tagMatch[0]);
        let user = bot.getUser(userId);
        let message = args.slice(tagMatch[0].length);

        bot.onmessage(user.username, user.id, event.channelId, message, event.wsevent);
    }

    /**
     * Sends link to add bot to server
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    link(bot, event) {
        bot.send(event.channelId, {
            embed: {
                color: 0xF2495D,
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
            requiredPermission: "BOT_ADMINISTRATOR"
        }));
        
        this._registerCommand("pretendget", this.pretendget, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        this._registerCommand("ping", this.ping);
        this._registerCommand("userinfo", this.userinfo);
        
        this._registerCommand("i am the bot admin", this.i_am_the_bot_admin);
        
        this._registerCommand("invite", this.link);
        this._registerCommand("link", this.link);
        this._registerCommand("code", this.code);
    }
}

module.exports = Default;