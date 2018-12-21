import { User, Guild, Channel } from "discord.js";

interface IMessage {
    author: User,
    channel: Channel,
    guild: Guild,
    content: string,
    /** actual event from the vendor (which implements this interface) */
    actual?: IMessage
}

export default IMessage;