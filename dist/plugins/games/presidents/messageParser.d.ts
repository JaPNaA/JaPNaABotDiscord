import PresidentsMain from "./game";
import { DiscordCommandEvent } from "../../../main/events";
import Player from "./player/player";
declare class MessageParser {
    game: PresidentsMain;
    constructor(game: PresidentsMain);
    parse(player: Player, event: DiscordCommandEvent): void;
    private parseRankAction;
}
export default MessageParser;
