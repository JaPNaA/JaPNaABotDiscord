const BotPlugin = require("../src/plugin.js");
const { toUserId } = require("../src/utils.js");

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
    iamthebotadmin(bot, event) {
        if (bot.recall("permissions", "_admin")) {
            if (bot.recall("permissions", "_admin") === event.userId) {
                bot.send(event.channelId, "Yes. You are the bot admin.");
            } else {
                bot.send(event.channelId, "You are not the bot admin.");
            }
            return;
        } else {
            bot.send(event.channelId, "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**");
            bot.remember("permissions", "_admin", event.userId, true);

            bot.editPermissions_user_global(event.userId, "BOT_ADMINISTRATOR", true);
        }
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
        this._registerCommand("ping", this.ping);
        this._registerCommand("link", this.link);
        this._registerCommand("invite", this.link);
        this._registerCommand("code", this.code);
        this._registerCommand("userinfo", this.userinfo);
        this._registerCommand("iamthebotadmin", this.iamthebotadmin);
    }
}

module.exports = Default;