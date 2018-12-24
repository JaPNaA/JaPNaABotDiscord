import { User, TextChannel, Guild } from "discord.js";
import IMessage from "./adapters/IMessage";
declare function fakeMessage(data: {
    author: User;
    channel: TextChannel;
    guild: Guild;
    content: string;
}): IMessage;
export { fakeMessage };
declare function mention(userId: string): string;
export { mention };
