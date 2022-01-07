import { TextChannel, User, Guild } from "discord.js";
import IMessage from "../adapters/IMessage";
declare function fakeMessage(data: {
    author: User;
    channel: TextChannel;
    guild: Guild;
    id: string;
    content: string;
}): IMessage;
export default fakeMessage;
