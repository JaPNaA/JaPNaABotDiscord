import BotHooks from "../../main/bot/botHooks";
declare abstract class Game {
    bot: BotHooks;
    constructor(botHooks: BotHooks);
    abstract _start(): void;
    abstract _stop(): void;
}
export default Game;
