import Bot from "../../../main/bot/bot/bot";
import BotCommandCallback from "../../../main/bot/command/commandCallback";
import Game from "../game";
declare class Lobby {
    private parentGame;
    private bot;
    private players;
    private registeredCommandNames;
    private playersPromiseRes?;
    private settings;
    constructor(parentGame: Game, bot: Bot);
    setSettings(settings: LobbySettings): void;
    getPlayers(): Promise<string[]>;
    addPlayer(userId: string): void;
    removeAllPlayers(): void;
    startLobby(): void;
    private joinCommand;
    private addPlayerAndAnnounce;
    private _addPlayer;
    private handleJoinError;
    private leaveCommand;
    private listPlayersCommand;
    private startCommand;
    private sendAboutMessage;
    stopLobby(): void;
    _registerCommand(name: string, callback: BotCommandCallback): void;
}
interface LobbySettings {
    minPlayers?: number;
    maxPlayers?: number;
    description?: string;
    dmLock?: boolean;
}
export default Lobby;
