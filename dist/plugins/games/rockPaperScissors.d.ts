import Bot from "../../main/bot/bot/bot";
import Games from "../games";
import Game from "./game";
import Lobby from "./utils/lobby";
export declare class RockPaperScissors extends Game {
    lobby: Lobby;
    private choices;
    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string);
    _start(): void;
    private requestChoice;
    private useCommand;
    private checkWinners;
    _stop(): void;
}
