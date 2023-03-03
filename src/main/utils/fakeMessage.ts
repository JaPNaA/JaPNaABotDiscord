import { User, Guild, TextBasedChannel, Channel, ThreadChannel } from "discord.js";
import IMessage from "../adapters/IMessage";

function fakeMessage(data: {
    author: User,
    channel: Channel | ThreadChannel,
    guild: Guild,
    id: string,
    content: string
}): IMessage {
    return {
        author: data.author,
        channel: data.channel as (TextBasedChannel | ThreadChannel), // assume that messages only come from text based channels... I hope I can assume that...
        guild: data.guild,
        content: data.content,
        id: data.id,
        createdTimestamp: Date.now()
    }
}

export default fakeMessage;