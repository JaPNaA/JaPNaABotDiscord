import { User, Guild, Channel, Message } from "discord.js";

interface IMessage {
    author: User;
    channel: Channel;
    guild: Guild;
    content: string;
    /** actual event from the vendor (which implements this interface) */
    actual?: IMessage;
    createdTimestamp: number;
}

export default IMessage;