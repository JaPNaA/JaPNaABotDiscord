import Bot from "../../../main/bot/bot/bot";
import BotCommandCallback from "../../../main/bot/command/commandCallback";
import Game from "../game";
declare class Lobby {
    private parentGame;
    private bot;
    private players;
    private registeredCommandNames;
    private playersPromiseRes?;
    private minPlayers?;
    private maxPlayers?;
    private description?;
    constructor(parentGame: Game, bot: Bot);
    setSettings({ minPlayers, maxPlayers, description }: {
        minPlayers?: number;
        maxPlayers?: number;
        description?: string;
    }): void;
    addPlayer(player: string): void;
    getPlayers(): Promise<string[]>;
    private joinCommand;
    private leaveCommand;
    private listPlayersCommand;
    private startCommand;
    startLobby(): void;
    private sendAboutMessage;
    stopLobby(): void;
    _registerCommand(name: string, callback: BotCommandCallback): void;
}
export default Lobby;
