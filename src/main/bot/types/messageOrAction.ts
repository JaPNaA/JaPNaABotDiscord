import { MessageOptions } from "discord.js";
import { Action } from "../actions/actions";

type MessageOrAction = Action | string | MessageOptions;

export default MessageOrAction;
