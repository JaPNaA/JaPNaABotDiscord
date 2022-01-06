declare class Permissions {
    static keys: string[];
    static specialCustoms: string[];
    [x: string]: any;
    num: bigint;
    CREATE_INSTANT_INVITE: boolean;
    KICK_MEMBERS: boolean;
    BAN_MEMBERS: boolean;
    ADMINISTRATOR: boolean;
    MANAGE_CHANNELS: boolean;
    MANAGE_GUILD: boolean;
    ADD_REACTIONS: boolean;
    VIEW_AUDIT_LOG: boolean;
    VIEW_CHANNEL: boolean;
    SEND_MESSAGES: boolean;
    SEND_TTS_MESSAGES: boolean;
    MANAGE_MESSAGES: boolean;
    EMBED_LINKS: boolean;
    ATTACH_FILES: boolean;
    READ_MESSAGE_HISTORY: boolean;
    MENTION_EVERYONE: boolean;
    USE_EXTERNAL_EMOJIS: boolean;
    CONNECT: boolean;
    SPEAK: boolean;
    MUTE_MEMBERS: boolean;
    DEAFEN_MEMBERS: boolean;
    MOVE_MEMBERS: boolean;
    USE_VAD: boolean;
    PRIORITY_SPEAKER: boolean;
    CHANGE_NICKNAME: boolean;
    MANAGE_NICKNAMES: boolean;
    MANAGE_ROLES: boolean;
    MANAGE_WEBHOOKS: boolean;
    MANAGE_EMOJIS: boolean;
    customPermissions: {
        [x: string]: boolean;
    };
    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(permissionsNumber?: bigint, extendsPermissions?: Permissions);
    /**
     * Sets all permissions to true
     */
    setAllPermissionsTrue(): void;
    has(permission: string): boolean;
    /** Converts capital to lowercase, replace underscores with spaces */
    toReadable(str: string): string;
    /** Converts this.* to markdown string, with true being bold */
    discordPermToString(): string;
    /**
     * Converts this.customPermissions to markdown string, with true being bold
     */
    customToString(): string;
    /** Converts this to a markdown string, with true being bold */
    toString(): string;
    getCustomPermissions(): string[];
    importCustomPermissions(keys: string[]): void;
    /** Writes a custom permission */
    writeCustomPermission(permission: string, value: boolean): void;
}
export default Permissions;
