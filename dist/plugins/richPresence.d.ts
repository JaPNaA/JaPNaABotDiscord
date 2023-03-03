import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
export default class RichPresence extends BotPlugin {
    private lastPresence?;
    private lastStatus;
    constructor(bot: Bot);
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(event: DiscordCommandEvent): Generator<never, void, unknown>;
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(event: DiscordCommandEvent): Generator<never, void, unknown>;
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(event: DiscordCommandEvent): Generator<never, void, unknown>;
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(event: DiscordCommandEvent): Generator<never, void, unknown>;
    /**
     * Changes rich presence to compete in a tournament
     * @param event string to set as compete
     */
    compete_in(event: DiscordCommandEvent): Generator<never, void, unknown>;
    set_status(event: DiscordCommandEvent): Generator<never, void, unknown>;
    private updatePresence;
    private updateStatus;
    _start(): void;
    _stop(): void;
}
