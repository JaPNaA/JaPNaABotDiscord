import { User, Client, Guild, Role, GuildMember, Message, DiscordAPIError, ActivityType, Options, EmbedData, Channel } from "discord.js";

import Logger from "../../utils/logger.js";
import MessageObject from "../types/messageObject.js";
import Bot from "./bot.js";

class PresenceSetter {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    setGame(name: string): void {
        this.client.user?.setPresence({
            activities: [{ name: name || undefined, type: ActivityType.Playing }]
        });
    }

    setWatch(name: string): void {
        this.client.user?.setPresence({
            activities: [{
                name: name || undefined,
                type: ActivityType.Watching
            }]
        });
    }

    setListen(name: string): void {
        this.client.user?.setPresence({
            activities: [{
                name: name || undefined,
                type: ActivityType.Listening
            }]
        });
    }

    setStream(name: string): void {
        this.client.user?.setPresence({
            activities: [{
                name: name || undefined,
                type: ActivityType.Streaming
            }]
        });
    }

    setCompete(name: string): void {
        this.client.user?.setPresence({
            activities: [{
                name: name || undefined,
                type: ActivityType.Competing
            }]
        });
    }
}

class SentMessageRecorder {
    recordedSentMessages: { [x: string]: any[] | null };
    constructor() {
        /** The recorded sent messages */
        this.recordedSentMessages = {};
    }

    /**
     * Records the sent message, if is recording in channel
     * @param channelId id of channel
     * @param message message that was sent
     */
    recordSentMessage(channelId: string, message: string | object): void {
        let sentMessagesArr: any[] | null = this.recordedSentMessages[channelId];
        if (!sentMessagesArr) { return; }

        sentMessagesArr.push(message);
    }

    /**
     * Starts recording message sent to a channel
     * @param channelId id of channel
     */
    startRecordingMessagesSentToChannel(channelId: string): void {
        this.recordedSentMessages[channelId] = [];
    }

    /**
     * Stops recording messages sent to a channel,
     * and flushes (clear and returns) the sent messages
     * that were recorded
     * @param channelId id of channel
     * @returns recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId: string): any[] {
        let sentMessages: any[] | null = this.recordedSentMessages[channelId];
        this.recordedSentMessages[channelId] = null;
        return sentMessages || [];
    }
}

class BotClient {
    id: undefined | string;
    client: Client;
    userIdDMMap: { [x: string]: string };
    presence: PresenceSetter;
    sentMessageRecorder: SentMessageRecorder;

    constructor(private bot: Bot, client: Client) {
        /** Discord.io Client */
        this.client = client;

        /** Maps userId to DM Channel Id */
        this.userIdDMMap = {};

        this.presence = new PresenceSetter(this.client);
        this.sentMessageRecorder = new SentMessageRecorder();

        // catch error, and logs them
        this.client.on("error", function (error: any): void {
            Logger.error(error);
        });

        this.bot.events.ready._addSystemHandler(this.onReady.bind(this));
    }

    onReady(): void {
        this.id = this.client.user!.id;
    }

    init(): void {
        this.id = this.client.user!.id;
    }

    isReady(): boolean {
        return Boolean(this.client.readyAt);
    }

    isSelf(authorId: string): boolean {
        return authorId === this.id;
    }

    // TODO: refactor send, sendDM

    /**
     * Send message
     * @returns A promise that resolves when sent
     */
    async send(channelId: string, message: string | Options): Promise<Message | Message[]> {
        Logger.log_message(">>", message);

        let promise: Promise<Message | Message[]>;
        let textChannel = await this.getChannel(channelId);

        if (!textChannel) {
            throw new Error("Cannot find channel");
        }

        if (!textChannel.isTextBased() || !('send' in textChannel)) {
            throw new TypeError("Cannot send to non-text channel");
        }

        const { preventedSystem } = await this.bot.events.send.dispatch({
            channelId: channelId,
            content: message
        });
        if (preventedSystem) { throw new Error("Cannot send message -- blocked"); }

        if (typeof message === "string") {
            if (message.trim().length === 0) {
                message = "_This message is empty_";
            }
            promise = textChannel.send(message);
        } else if (typeof message === "object") {
            promise = textChannel.send(message as any);
        } else {
            throw new TypeError("Message is not of valid type");
        }

        this.sentMessageRecorder.recordSentMessage(channelId, message);

        return promise;
    }

    async sendEmbed(channelId: string, embed: EmbedData): Promise<Message | Message[]> {
        return this.send(channelId, {
            embeds: [embed]
        });
    }

    /**
     * Sends direct message
     * @param userId id of user
     * @param message message to send
     * @param failCallback callback if failed
     * @returns A promise that resolves when message sends, rejcts if fail
     */
    async sendDM(userId: string, message: string | MessageObject, failCallback?: Function): Promise<Message | Message[]> {
        Logger.log_message("D>", message);

        let user = await this.getUser(userId);
        let promise: Promise<Message | Message[]>;

        if (!user) { throw new Error("User not found"); }

        const { preventedSystem } = await this.bot.events.sendDM.dispatch({
            userId: userId,
            content: message
        });
        if (preventedSystem) { throw new Error("Cannot send message -- blocked"); }

        if (typeof message === "object" && message.hasOwnProperty("message")) {
            promise = user.send(message as any);
        } else {
            if (typeof message === "string" && message.trim().length === 0) {
                message = "_This message is empty_";
            }
            promise = user.send(message as any);
        }

        if (failCallback) {
            promise.catch(() => failCallback());
        }


        return promise;
    }

    getChannel(channelId: string): Promise<Channel | null> {
        return this.client.channels.fetch(channelId);
    }

    async getServerFromChannel(channelId: string): Promise<Guild | undefined> {
        let channel = await this.getChannel(channelId);
        if (!channel) { return; }
        // @ts-ignore
        return channel.guild;
    }

    getServer(serverId: string): Promise<Guild | undefined> {
        return this.client.guilds.fetch(serverId);
    }

    async getUser(userId: string): Promise<User | undefined> {
        try {
            return await this.client.users.fetch(userId);
        } catch (err) {
            if (err instanceof DiscordAPIError) {
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async getMessageFromChannel(channelId: string, messageId: string): Promise<Message> {
        const channel = await this.getChannel(channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            return channel.messages.fetch(messageId);
        } else {
            throw new Error("Channel doesn't exist or is not text");
        }
    }

    async getRole(roleId: string, serverId: string): Promise<Role | null> {
        let server = await this.getServer(serverId);
        if (!server) { return null; }
        return server.roles.fetch(roleId);
    }

    async getMemberFromServer(userId: string, serverId: string): Promise<GuildMember | undefined> {
        let server = await this.getServer(serverId);
        if (!server) { return; }
        return server.members.fetch(userId);
    }

    getPing(): number {
        return this.client.ws.ping;
    }
}

export default BotClient;