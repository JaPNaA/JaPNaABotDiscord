import { User, Guild, TextBasedChannel } from "discord.js";
import IMessage from "../adapters/IMessage";
declare function fakeMessage(data: {
    author: User;
    channel: TextBasedChannel;
    guild: Guild;
    id: string;
    content: string;
}): IMessage;
export default fakeMessage;
