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
            response.push({
                name: "User info",
                value: JSON.stringify(user) + "\n"
            });

            if (bot.getChannel(event.channelId)) {
                response.push({
                    name: "User of server info",
                    value: JSON.stringify(bot.getUser_channel(userId, event.channelId)) + "\n"
                });
    
                const permissions = bot.getPermissions_channel(event.channelId, userId);
                response.push({
                    name: "Permissions in server",
                    value: permissions.toString() + "\n"
                });
            }

            bot.send(event.channelId, {
                embed: {
                    color: 3447003,
                    author: {
                        name: "Information for " + user.username,
                        icon_url: "https://cdn.discordapp.com/avatars/" + userId + "/" + user.avatar + ".png?size=32"
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
    }
}

module.exports = Default;