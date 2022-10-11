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
    private addPlayerGetAnnounceString;
    private _addPlayer;
    private getJoinErrorString;
    private leaveCommand;
    private listPlayersCommand;
    private startCommand;
    private finishPlayerGathering;
    private sendAboutMessage;
    stopLobby(): void;
    _registerCommand(name: string, callback: BotCommandCallback): void;
}
interface LobbySettings {
    minPlayers?: number;
    maxPlayers?: number;
    /**
     * Description of the game
     */
    description?: string;
    /**
     * Does the game require players to use their DMs?
     */
    dmLock?: boolean;
    /**
     * Start as soon as enough players join?
     * (Instead of waiting for the `start` command?)
     */
    autoStart?: boolean;
}
export default Lobby;
