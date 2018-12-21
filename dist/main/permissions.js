"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("./utils.js");
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
        this.CREATE_INSTANT_INVITE = utils_js_1.getBit(this.num, 0);
        /** Allows kicking members */
        this.KICK_MEMBERS = utils_js_1.getBit(this.num, 1);
        /** Allows banning members */
        this.BAN_MEMBERS = utils_js_1.getBit(this.num, 2);
        /** Allows all permissions and bypasses channel permission overwrites */
        this.ADMINISTRATOR = utils_js_1.getBit(this.num, 3);
        /** Allows management and editing of channels */
        this.MANAGE_CHANNELS = utils_js_1.getBit(this.num, 4);
        /** Allows management and editing of the guild */
        this.MANAGE_GUILD = utils_js_1.getBit(this.num, 5);
        /** Allows for the addition of reactions to messages */
        this.ADD_REACTIONS = utils_js_1.getBit(this.num, 6);
        /** Allows for viewing of audit logs */
        this.VIEW_AUDIT_LOG = utils_js_1.getBit(this.num, 7);
        /** Allows guild members to view a channel, which includes reading messages in text channels */
        this.VIEW_CHANNEL = utils_js_1.getBit(this.num, 8);
        /** Allows for sending messages in a channel */
        this.SEND_MESSAGES = utils_js_1.getBit(this.num, 9);
        /** Allows for sending of /tts messages */
        this.SEND_TTS_MESSAGES = utils_js_1.getBit(this.num, 10);
        /** Allows for deletion of other users messages */
        this.MANAGE_MESSAGES = utils_js_1.getBit(this.num, 11);
        /** Links sent by users with this permission will be auto-embedded */
        this.EMBED_LINKS = utils_js_1.getBit(this.num, 12);
        /** Allows for uploading images and files */
        this.ATTACH_FILES = utils_js_1.getBit(this.num, 13);
        /** Allows for reading of message history */
        this.READ_MESSAGE_HISTORY = utils_js_1.getBit(this.num, 14);
        /** Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel */
        this.MENTION_EVERYONE = utils_js_1.getBit(this.num, 15);
        /** Allows the usage of custom emojis from other servers */
        this.USE_EXTERNAL_EMOJIS = utils_js_1.getBit(this.num, 16);
        /** Allows for joining of a voice channel */
        this.CONNECT = utils_js_1.getBit(this.num, 17);
        /** Allows for speaking in a voice channel */
        this.SPEAK = utils_js_1.getBit(this.num, 18);
        /** Allows for muting members in a voice channel */
        this.MUTE_MEMBERS = utils_js_1.getBit(this.num, 19);
        /** Allows for deafening of members in a voice channel */
        this.DEAFEN_MEMBERS = utils_js_1.getBit(this.num, 20);
        /** Allows for moving of members between voice channels */
        this.MOVE_MEMBERS = utils_js_1.getBit(this.num, 21);
        /** Allows for using voice-activity-detection in a voice channel */
        this.USE_VAD = utils_js_1.getBit(this.num, 22);
        /** Allows for using priority speaker in a voice channel */
        this.PRIORITY_SPEAKER = utils_js_1.getBit(this.num, 23);
        /** Allows for modification of own nickname */
        this.CHANGE_NICKNAME = utils_js_1.getBit(this.num, 24);
        /** Allows for modification of other users nicknames */
        this.MANAGE_NICKNAMES = utils_js_1.getBit(this.num, 25);
        /** Allows management and editing of roles */
        this.MANAGE_ROLES = utils_js_1.getBit(this.num, 26);
        /** Allows management and editing of webhooks */
        this.MANAGE_WEBHOOKS = utils_js_1.getBit(this.num, 27);
        /** Allows management and editing of emojis */
        this.MANAGE_EMOJIS = utils_js_1.getBit(this.num, 28);
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
    /**
     * Check if has permission
     * @param {String} permission string
     * @returns {Boolean} has permission?
     */
    has(permission) {
        return Boolean(this[permission]) || Boolean(this.customPermissions[permission]);
    }
    /**
     * Converts capital to lowercase, replace underscores with spaces
     * @param {String} str input string
     * @returns {String} readable string
     */
    toReadable(str) {
        return str.toLowerCase().replace(/_/g, " ");
    }
    /**
     * Converts this.* to markdown string, with true being bold
     * @returns {String}
     */
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
     * @returns {String}
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
    /**
     * Converts this to a markdown string, with true being bold
     * @returns {String}
     */
    toString() {
        return this.discordPermToString() + "\n" + this.customToString();
    }
    /**
     * lists custom permissions has
     * @returns {String[]} custom permissions
     */
    getCustomPermissions() {
        /** @type {String[]} */
        let keys = [];
        let okeys = Object.keys(this.customPermissions);
        for (let okey of okeys) {
            if (this.customPermissions[okey]) {
                keys.push(okey);
            }
        }
        return keys;
    }
    /**
     * Imports custom permissions
     * @param {String[]} keys custom permissions
     */
    importCustomPermissions(keys) {
        if (!keys)
            return;
        if (typeof keys === "string") { // jic someone still has old method
            keys = JSON.parse(keys);
        }
        for (let key of keys) {
            this.customPermissions[key] = true;
        }
    }
    /**
     * Writes a custom permission
     * @param {String} permission permission to write
     * @param {Boolean} value value of permission
     */
    customWrite(permission, value) {
        this.customPermissions[permission] = value;
    }
}
/**
 * List of every permission
 * @type {String[]}
 */
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
/**
 * Special custom permissions
 * @type {String[]}
 */
Permissions.specialCustoms = [
    "BOT_ADMINISTRATOR"
];
exports.default = Permissions;
