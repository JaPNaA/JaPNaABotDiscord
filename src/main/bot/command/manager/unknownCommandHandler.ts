import { DiscordCommandEvent } from "../../../events";
import BotHooks from "../../botHooks";
type UnknownCommandHandler = (bot: BotHooks, event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;