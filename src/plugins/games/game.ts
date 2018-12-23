import BotHooks from "../../main/bot/botHooks";

abstract class Game {
    bot: BotHooks;

    constructor(botHooks: BotHooks) {
        this.bot = botHooks;
    }
    abstract _start(): void;
    abstract _stop(): void;
}

export default Game;