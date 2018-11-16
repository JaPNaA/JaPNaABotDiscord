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

        this.CREATE_INSTANT_INVITE = getBit(this.num, 0);
        this.KICK_MEMBERS = getBit(this.num, 1);
        this.BAN_MEMBERS = getBit(this.num, 2);
        this.ADMINISTRATOR = getBit(this.num, 3);
        this.MANAGE_CHANNELS = getBit(this.num, 4);
        this.MANAGE_GUILD = getBit(this.num, 5);
        this.ADD_REACTIONS = getBit(this.num, 6);
        this.VIEW_AUDIT_LOG = getBit(this.num, 7);
        this.VIEW_CHANNEL = getBit(this.num, 8);
        this.SEND_MESSAGES = getBit(this.num, 9);
        this.SEND_TTS_MESSAGES = getBit(this.num, 10);
        this.MANAGE_MESSAGES = getBit(this.num, 11);
        this.EMBED_LINKS = getBit(this.num, 12);
        this.ATTACH_FILES = getBit(this.num, 13);
        this.READ_MESSAGE_HISTORY = getBit(this.num, 14);
        this.MENTION_EVERYONE = getBit(this.num, 15);
        this.USE_EXTERNAL_EMOJIS = getBit(this.num, 16);
        this.CONNECT = getBit(this.num, 17);
        this.SPEAK = getBit(this.num, 18);
        this.MUTE_MEMBERS = getBit(this.num, 19);
        this.DEAFEN_MEMBERS = getBit(this.num, 20);
        this.MOVE_MEMBERS = getBit(this.num, 21);
        this.USE_VAD = getBit(this.num, 22);
        this.PRIORITY_SPEAKER = getBit(this.num, 23);
        this.CHANGE_NICKNAME = getBit(this.num, 24);
        this.MANAGE_NICKNAMES = getBit(this.num, 25);
        this.MANAGE_ROLES = getBit(this.num, 26);
        this.MANAGE_WEBHOOKS = getBit(this.num, 27);
        this.MANAGE_EMOJIS = getBit(this.num, 28);
    }

    toReadable(str) {
        return str.toLowerCase().replace(/_/g, " ");
    }

    toString() {
        let str = [];
        for (let key of Permissions.keys) {
            if (this[key]) {
                str.push("**" + this.toReadable(key) + "**");
            } else {
                str.push(this.toReadable(key));
            }
        }

        return this.num + ": " + str.join(", ");
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

module.exports = Permissions;