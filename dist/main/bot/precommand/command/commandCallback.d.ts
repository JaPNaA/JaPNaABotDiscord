import BotHooks from "../../botHooks";
import { DiscordCommandEvent } from "../../../events";
declare type BotCommandCallback = (bot: BotHooks, event: DiscordCommandEvent, args: string) => any;
export default BotCommandCallback;
