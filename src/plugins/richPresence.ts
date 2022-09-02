import { PresenceStatusData } from "discord.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";

type PresenceType = "play" | "watch" | "listen" | "stream";

export default class RichPresence extends BotPlugin {
    private lastPresence?: {
        type: PresenceType,
        name: string
    };
    private lastStatus: PresenceStatusData = "online";

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "richPresence";
        this.lastPresence = this.bot.memory.get(this.pluginName, "lastPresence");
        this.lastStatus = this.bot.memory.get(this.pluginName, "lastStatus") || "online";
    }

    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    public *play(event: DiscordCommandEvent) {
        this.updatePresence("play", event.arguments);
    }

    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    public *watch(event: DiscordCommandEvent) {
        this.updatePresence("watch", event.arguments);
    }

    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    public *listen_to(event: DiscordCommandEvent) {
        this.updatePresence("listen", event.arguments);
    }

    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    public *stream(event: DiscordCommandEvent) {
        this.updatePresence("stream", event.arguments);
    }

    public *set_status(event: DiscordCommandEvent) {
        if (
            event.arguments === "online" ||
            event.arguments === "idle" ||
            event.arguments === "dnd" ||
            event.arguments === "invisible"
        ) {
            this.updateStatus(event.arguments);
        } else {
            this.bot.client.send(event.channelId, `\`${event.arguments}\` is not a valid status.`);
        }
    }

    private updatePresence(type: PresenceType, name: string): void {
        this.lastPresence = { type, name };
        this.bot.memory.write(this.pluginName, "lastPresence", this.lastPresence);

        switch (type) {
            case "play":
                this.bot.client.presence.setGame(name);
                break;
            case "watch":
                this.bot.client.presence.setWatch(name);
                break;
            case "listen":
                this.bot.client.presence.setListen(name);
                break;
            case "stream":
                this.bot.client.presence.setStream(name);
                break;
        }
    }

    private updateStatus(status: PresenceStatusData) {
        this.bot.client.client.user?.setStatus(status);
        this.lastStatus = status;
        this.bot.memory.write(this.pluginName, "lastStatus", this.lastStatus);
    }

    public _start(): void {
        this.bot.events.ready.addHandler(() => {
            if (this.lastPresence) {
                this.updatePresence(this.lastPresence.type, this.lastPresence.name);
            }
            this.updateStatus(this.lastStatus);
        });

        this._registerDefaultCommand("play", this.play, {
            help: {
                description: "Sets the \"playing\" value",
                overloads: [{
                    "value": "The \"game\" to \"play\""
                }],
                examples: [
                    ["play", "Removes the \"playing\" tag"],
                    ["play nothing", "Sets the \"playing\" tag to \"nothing\"."]
                ]
            },
            group: "Rich Presence",
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });

        this._registerDefaultCommand("watch", this.watch, {
            help: {
                description: "Sets the \"watching\" value",
                overloads: [{
                    "value": "The \"game\" to \"watch\""
                }],
                examples: [
                    ["watch", "Removes the \"watching\" tag"],
                    ["watch nothing", "Sets the \"watching\" tag to \"nothing\"."]
                ]
            },
            group: "Rich Presence",
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });

        this._registerDefaultCommand("listen to", this.listen_to, {
            help: {
                description: "Sets the \"listening\" value",
                overloads: [{
                    "value": "The \"thing\" to \"listen\" to"
                }],
                examples: [
                    ["listen to", "Removes the \"listen\" tag"],
                    ["listen to nothing", "Sets the \"listening\" tag to \"nothing\"."]
                ]
            },
            group: "Rich Presence",
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });

        this._registerDefaultCommand("stream", this.stream, {
            help: {
                description: "Sets the \"stream\" value",
                overloads: [{
                    "value": "The \"thing\" to \"stream\""
                }],
                examples: [
                    ["stream", "Removes the \"streaming\" tag"],
                    ["stream nothing", "Sets the \"streaming\" tag to \"nothing\"."]
                ]
            },
            group: "Rich Presence",
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });

        this._registerDefaultCommand("set status", this.set_status, {
            help: {
                description: "Sets the bot's status (online, idle, dnd, invisible, etc.)",
                overloads: [{
                    "status": "The status (online, idle, dnd, invisible)"
                }],
                examples: [
                    ["set status online", "Sets the bot's status to online (green)"],
                    ["set status idle", "Sets the bot's status to idle (yellow)"]
                ]
            },
            group: "Rich Presence",
            requiredCustomPermission: "BOT_ADMINISTRATOR"
        });
    }

    public _stop(): void { }
}
