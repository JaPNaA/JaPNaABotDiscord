import { User, Client, Channel, Guild, Role, GuildMember, Message } from "discord.js";
import BotHooks from "./botHooks.js";
import MessageObject from "./messageObject.js";
declare class PresenceSetter {
    client: Client;
    constructor(client: Client);
    setGame(name: string): void;
    setWatch(name: string): void;
    setListen(name: string): void;
    setStream(name: string): void;
}
declare class SentMessageRecorder {
    recordedSentMessages: {
        [x: string]: any[] | null;
    };
    constructor();
    /**
     * Records the sent message, if is recording in channel
     * @param channelId id of channel
     * @param message message that was sent
     */
    recordSentMessage(channelId: string, message: string | object): void;
    /**
     * Starts recording message sent to a channel
     * @param channelId id of channel
     */
    startRecordingMessagesSentToChannel(channelId: string): void;
    /**
     * Stops recording messages sent to a channel,
     * and flushes (clear and returns) the sent messages
     * that were recorded
     * @param channelId id of channel
     * @returns recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId: string): any[];
}
declare class BotClient {
    botHooks: BotHooks;
    id: undefined | string;
    client: Client;
    userIdDMMap: {
        [x: string]: string;
    };
    presence: PresenceSetter;
    sentMessageRecorder: SentMessageRecorder;
    constructor(botHooks: BotHooks, client: Client);
    onReady(): void;
    init(): void;
    isReady(): boolean;
    isSelf(authorId: string): boolean;
    /**
     * Send message
     * @returns A promise that resolves when sent
     */
    send(channelId: string, message: string | MessageObject): Promise<Message | Message[]>;
    /**
     * Sends direct message
     * @param userId id of user
     * @param message message to send
     * @param failCallback callback if failed
     * @returns A promise that resolves when message sends, rejcts if fail
     */
    sendDM(userId: string, message: string | MessageObject, failCallback?: Function): Promise<Message | Message[]>;
    getChannel(channelId: string): Channel | undefined;
    getServerFromChannel(channelId: string): Guild | undefined;
    getServer(serverId: string): Guild | undefined;
    getUser(userId: string): User | undefined;
    getRole(roleId: string, serverId: string): Role | undefined;
    getMemberFromServer(userId: string, serverId: string): GuildMember | undefined;
    getPing(): number;
}
export default BotClient;
