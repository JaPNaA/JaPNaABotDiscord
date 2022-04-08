import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
export default class RichPresence extends BotPlugin {
    private lastPresence?;
    constructor(bot: Bot);
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(event: DiscordCommandEvent): void;
    private updatePresence;
    _start(): void;
    _stop(): void;
}