import PresidentsMain from "./game";
import DiscordCommandEvent from "../../../main/bot/types/discordCommandEvent";
import Player from "./player/player";
declare class MessageParser {
    game: PresidentsMain;
    constructor(game: PresidentsMain);
    parse_pass(player: Player, event: DiscordCommandEvent): void;
    parse_use(player: Player, event: DiscordCommandEvent): void;
    private parseRankAction;
}
export default MessageParser;
