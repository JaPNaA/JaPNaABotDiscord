import Pile from "../cards/pile";
import { Message } from "discord.js";
import Player from "./player.js";
declare class Logic {
    players: Player[];
    pile: Pile;
    pileMessage?: Message;
    constructor(playerIds: string[]);
}
export default Logic;
