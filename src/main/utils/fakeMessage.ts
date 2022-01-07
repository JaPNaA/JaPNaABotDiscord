import { TextChannel, User, Guild } from "discord.js";
import IMessage from "../adapters/IMessage";

function fakeMessage(data: {
    author: User,
    channel: TextChannel,
    guild: Guild,
    id: string,
    content: string
}): IMessage {
    return {
        author: data.author,
        channel: data.channel,
        guild: data.guild,
        content: data.content,
        id: data.id,
        createdTimestamp: Date.now()
    }
}

export default fakeMessage;