"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getBit_1 = __importDefault(require("../utils/getBit"));
class Permissions {
    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(permissionsNumber, extendsPermissions) {
        this.num = permissionsNumber || 0;
        if (extendsPermissions) {
            this.num |= extendsPermissions.num;
        }
        /** Allows creation of instant invites */
        this.CREATE_INSTANT_INVITE = getBit_1.default(this.num, 0);
        /** Allows kicking members */
        this.KICK_MEMBERS = getBit_1.default(this.num, 1);
        /** Allows banning members */
        this.BAN_MEMBERS = getBit_1.default(this.num, 2);
        /** Allows all permissions and bypasses channel permission overwrites */
        this.ADMINISTRATOR = getBit_1.default(this.num, 3);
        /** Allows management and editing of channels */
        this.MANAGE_CHANNELS = getBit_1.default(this.num, 4);
        /** Allows management and editing of the guild */
        this.MANAGE_GUILD = getBit_1.default(this.num, 5);
        /** Allows for the addition of reactions to messages */
        this.ADD_REACTIONS = getBit_1.default(this.num, 6);
        /** Allows for viewing of audit logs */
        this.VIEW_AUDIT_LOG = getBit_1.default(this.num, 7);
        /** Allows guild members to view a channel, which includes reading messages in text channels */
        this.VIEW_CHANNEL = getBit_1.default(this.num, 8);
        /** Allows for sending messages in a channel */
        this.SEND_MESSAGES = getBit_1.default(this.num, 9);
        /** Allows for sending of /tts messages */
        this.SEND_TTS_MESSAGES = getBit_1.default(this.num, 10);
        /** Allows for deletion of other users messages */
        this.MANAGE_MESSAGES = getBit_1.default(this.num, 11);
        /** Links sent by users with this permission will be auto-embedded */
        this.EMBED_LINKS = getBit_1.default(this.num, 12);
        /** Allows for uploading images and files */
        this.ATTACH_FILES = getBit_1.default(this.num, 13);
        /** Allows for reading of message history */
        this.READ_MESSAGE_HISTORY = getBit_1.default(this.num, 14);
        /**
         * Allows for using the @everyone tag to notify all users in a channel,
         * and the @here tag to notify all online users in a channel
         */
        this.MENTION_EVERYONE = getBit_1.default(this.num, 15);
        /** Allows the usage of custom emojis from other servers */
        this.USE_EXTERNAL_EMOJIS = getBit_1.default(this.num, 16);
        /** Allows for joining of a voice channel */
        this.CONNECT = getBit_1.default(this.num, 17);
        /** Allows for speaking in a voice channel */
        this.SPEAK = getBit_1.default(this.num, 18);
        /** Allows for muting members in a voice channel */
        this.MUTE_MEMBERS = getBit_1.default(this.num, 19);
        /** Allows for deafening of members in a voice channel */
        this.DEAFEN_MEMBERS = getBit_1.default(this.num, 20);
        /** Allows for moving of members between voice channels */
        this.MOVE_MEMBERS = getBit_1.default(this.num, 21);
        /** Allows for using voice-activity-detection in a voice channel */
        this.USE_VAD = getBit_1.default(this.num, 22);
        /** Allows for using priority speaker in a voice channel */
        this.PRIORITY_SPEAKER = getBit_1.default(this.num, 23);
        /** Allows for modification of own nickname */
        this.CHANGE_NICKNAME = getBit_1.default(this.num, 24);
        /** Allows for modification of other users nicknames */
        this.MANAGE_NICKNAMES = getBit_1.default(this.num, 25);
        /** Allows management and editing of roles */
        this.MANAGE_ROLES = getBit_1.default(this.num, 26);
        /** Allows management and editing of webhooks */
        this.MANAGE_WEBHOOKS = getBit_1.default(this.num, 27);
        /** Allows management and editing of emojis */
        this.MANAGE_EMOJIS = getBit_1.default(this.num, 28);
        if (this.ADMINISTRATOR) {
            this.setAllPermissionsTrue();
        }
        /** Custom Permissions */
        this.customPermissions = {};
    }
    /**
     * Sets all permissions to true
     */
    setAllPermissionsTrue() {
        for (let key of Permissions.keys) {
            this[key] = true;
        }
    }
    has(permission) {
        return Boolean(this[permission]) || Boolean(this.customPermissions[permission]);
    }
    /** Converts capital to lowercase, replace underscores with spaces */
    toReadable(str) {
        return str.toLowerCase().replace(/_/g, " ");
    }
    /** Converts this.* to markdown string, with true being bold */
    discordPermToString() {
        let str = [];
        for (let key of Permissions.keys) {
            if (this[key]) {
                str.push("**" + this.toReadable(key) + "**");
            }
            else {
                str.push(this.toReadable(key));
            }
        }
        return this.num + ": " + str.join(", ");
    }
    /**
     * Converts this.customPermissions to markdown string, with true being bold
     */
    customToString() {
        let str = [];
        let keys = Object.keys(this.customPermissions);
        for (let key of keys) {
            if (this.customPermissions[key]) {
                str.push("**" + this.toReadable(key) + "**");
            }
            else {
                str.push(this.toReadable(key));
            }
        }
        if (str.length) {
            return "Custom: " + str.join(", ");
        }
        else {
            return "Custom: none";
        }
    }
    /** Converts this to a markdown string, with true being bold */
    toString() {
        return this.discordPermToString() + "\n" + this.customToString();
    }
    getCustomPermissions() {
        let keys = [];
        let okeys = Object.keys(this.customPermissions);
        for (let okey of okeys) {
            if (this.customPermissions[okey]) {
                keys.push(okey);
            }
        }
        return keys;
    }
    importCustomPermissions(keys) {
        if (!keys) {
            return;
        }
        if (typeof keys === "string") { // jic someone still has old method
            keys = JSON.parse(keys);
        }
        for (let key of keys) {
            this.customPermissions[key] = true;
        }
    }
    /** Writes a custom permission */
    writeCustomPermission(permission, value) {
        this.customPermissions[permission] = value;
    }
}
Permissions.keys = [
    "CREATE_INSTANT_INVITE", "KICK_MEMBERS",
    "BAN_MEMBERS", "ADMINISTRATOR", "MANAGE_CHANNELS",
    "MANAGE_GUILD", "ADD_REACTIONS", "VIEW_AUDIT_LOG",
    "VIEW_CHANNEL", "SEND_MESSAGES",
    "SEND_TTS_MESSAGES", "MANAGE_MESSAGES",
    "EMBED_LINKS", "ATTACH_FILES",
    "READ_MESSAGE_HISTORY", "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK",
    "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS",
    "USE_VAD", "PRIORITY_SPEAKER", "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES", "MANAGE_ROLES",
    "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"
];
Permissions.specialCustoms = [
    "BOT_ADMINISTRATOR"
];
exports.default = Permissions;
