const { getBit } = require("./utils.js");

class Permissions {
    /**
     * Permissions Constructor
     * @param {Number} [permissionsNumber=0] permission number
     * @param {Permissions} [extendsPermissions] extends other permissions
     */
    constructor(permissionsNumber, extendsPermissions) {
        this.num = permissionsNumber || 0;

        if (extendsPermissions) {
            this.num |= extendsPermissions.num;
        }

        /** Allows creation of instant invites */
        this.CREATE_INSTANT_INVITE = getBit(this.num, 0);
        /** Allows kicking members */
        this.KICK_MEMBERS = getBit(this.num, 1);
        /** Allows banning members */
        this.BAN_MEMBERS = getBit(this.num, 2);
        /** Allows all permissions and bypasses channel permission overwrites */
        this.ADMINISTRATOR = getBit(this.num, 3);
        /** Allows management and editing of channels */
        this.MANAGE_CHANNELS = getBit(this.num, 4);
        /** Allows management and editing of the guild */
        this.MANAGE_GUILD = getBit(this.num, 5);
        /** Allows for the addition of reactions to messages */
        this.ADD_REACTIONS = getBit(this.num, 6);
        /** Allows for viewing of audit logs */
        this.VIEW_AUDIT_LOG = getBit(this.num, 7);
        /** Allows guild members to view a channel, which includes reading messages in text channels */
        this.VIEW_CHANNEL = getBit(this.num, 8);
        /** Allows for sending messages in a channel */
        this.SEND_MESSAGES = getBit(this.num, 9);
        /** Allows for sending of /tts messages */
        this.SEND_TTS_MESSAGES = getBit(this.num, 10);
        /** Allows for deletion of other users messages */
        this.MANAGE_MESSAGES = getBit(this.num, 11);
        /** Links sent by users with this permission will be auto-embedded */
        this.EMBED_LINKS = getBit(this.num, 12);
        /** Allows for uploading images and files */
        this.ATTACH_FILES = getBit(this.num, 13);
        /** Allows for reading of message history */
        this.READ_MESSAGE_HISTORY = getBit(this.num, 14);
        /** Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel */
        this.MENTION_EVERYONE = getBit(this.num, 15);
        /** Allows the usage of custom emojis from other servers */
        this.USE_EXTERNAL_EMOJIS = getBit(this.num, 16);
        /** Allows for joining of a voice channel */
        this.CONNECT = getBit(this.num, 17);
        /** Allows for speaking in a voice channel */
        this.SPEAK = getBit(this.num, 18);
        /** Allows for muting members in a voice channel */
        this.MUTE_MEMBERS = getBit(this.num, 19);
        /** Allows for deafening of members in a voice channel */
        this.DEAFEN_MEMBERS = getBit(this.num, 20);
        /** Allows for moving of members between voice channels */
        this.MOVE_MEMBERS = getBit(this.num, 21);
        /** Allows for using voice-activity-detection in a voice channel */
        this.USE_VAD = getBit(this.num, 22);
        /** Allows for using priority speaker in a voice channel */
        this.PRIORITY_SPEAKER = getBit(this.num, 23);
        /** Allows for modification of own nickname */
        this.CHANGE_NICKNAME = getBit(this.num, 24);
        /** Allows for modification of other users nicknames */
        this.MANAGE_NICKNAMES = getBit(this.num, 25);
        /** Allows management and editing of roles */
        this.MANAGE_ROLES = getBit(this.num, 26);
        /** Allows management and editing of webhooks */
        this.MANAGE_WEBHOOKS = getBit(this.num, 27);
        /** Allows management and editing of emojis */
        this.MANAGE_EMOJIS = getBit(this.num, 28);

        /** Custom Permissions */
        this.customPermissions = {};
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
     * Converts this to a markdown string, with true being bold
     * @returns {String}
     */
    toString() {
        let str = [];
        for (let key of Permissions.keys) {
            if (this[key]) {
                str.push("**" + this.toReadable(key) + "**");
            } else {
                str.push(this.toReadable(key));
            }
        }

        let customStr = [];
        let customKeys = Object.keys(this.customPermissions);
        for (let key of customKeys) {
            if (this.customPermissions[key]) {
                customStr.push("**" + this.toReadable(key) + "**");
            } else {
                customStr.push(this.toReadable(key));
            }
        }

        return this.num + ": " + str.join(", ") + "\n" + "Custom: " + customStr.join(", ");
    }

    /**
     * Converts custom permissions to json
     * @returns {String} json string
     */
    customToJSON() {
        let keys = [];
        let okeys = Object.keys(this.customPermissions);

        for (let okey of okeys) {
            if (this.customPermissions[okey]) {
                keys.push(okey);
            }
        }

        return JSON.stringify(keys);
    }

    /**
     * Imports json string to customPermissions
     * @param {String} json string
     */
    customImportJSON(json) {
        if (!json) return;
        
        let keys = JSON.parse(json);
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

module.exports = Permissions;