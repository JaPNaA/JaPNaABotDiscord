import { User, Guild, TextBasedChannel, ThreadChannel } from "discord.js";

interface IMessage {
    author: User;
    channel: TextBasedChannel | ThreadChannel;
    guild: Guild | null;
    id: string;
    content: string;
    /** actual event from the vendor (which implements this interface) */
    actual?: IMessage;
    createdTimestamp: number;
}

export default IMessage;