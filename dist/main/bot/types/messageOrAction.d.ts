import { MessageCreateOptions } from "discord.js";
import { Action } from "../actions/actions";
type MessageOrAction = Action | string | MessageCreateOptions;
export default MessageOrAction;
