"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
class RichPresence extends plugin_1.default {
    lastPresence;
    constructor(bot) {
        super(bot);
        this.pluginName = "richPresence";
        this.lastPresence = this.bot.memory.get(this.pluginName, "lastPresence");
    }
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(event) {
        this.updatePresence("play", event.arguments);
    }
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(event) {
        this.updatePresence("watch", event.arguments);
    }
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(event) {
        this.updatePresence("listen", event.arguments);
    }
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(event) {
        this.updatePresence("stream", event.arguments);
    }
    updatePresence(type, name) {
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
    _start() {
        this.bot.events.ready.addHandler(() => {
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
    }
    _stop() { }
}
exports.default = RichPresence;
