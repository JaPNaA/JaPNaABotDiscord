import { MessageOptions } from "discord.js";
import { Action } from "../actions/actions";
declare type MessageOrAction = Action | string | MessageOptions;
export default MessageOrAction;
