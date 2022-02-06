import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";

type PresenceType = "play" | "watch" | "listen" | "stream";

export default class RichPresence extends BotPlugin {
    private lastPresence?: {
        type: PresenceType,
        name: string
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "richPresence"
        this.lastPresence = this.bot.memory.get(this.pluginName, "lastPresence");
    }

    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    public play(event: DiscordCommandEvent): void {
        this.updatePresence("play", event.arguments);
    }

    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    public watch(event: DiscordCommandEvent): void {
        this.updatePresence("watch", event.arguments);
    }

    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    public listen_to(event: DiscordCommandEvent): void {
        this.updatePresence("listen", event.arguments);
    }

    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    public stream(event: DiscordCommandEvent): void {
        this.updatePresence("stream", event.arguments);
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

    public _start(): void {
        this.bot.events.on("ready", () => {
            if (this.lastPresence) {
                this.updatePresence(this.lastPresence.type, this.lastPresence.name);
            }
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
            requiredPermission: "BOT_ADMINISTRATOR"
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
            requiredPermission: "BOT_ADMINISTRATOR"
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
            requiredPermission: "BOT_ADMINISTRATOR"
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
            requiredPermission: "BOT_ADMINISTRATOR"
        });
    }

    public _stop(): void { }
}
