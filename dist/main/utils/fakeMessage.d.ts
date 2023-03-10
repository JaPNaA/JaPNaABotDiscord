import { User, Guild, Channel, ThreadChannel } from "discord.js";
import IMessage from "../adapters/IMessage";
declare function fakeMessage(data: {
    author: User;
    channel: Channel | ThreadChannel;
    guild: Guild;
    id: string;
    content: string;
}): IMessage;
export default fakeMessage;
