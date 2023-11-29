"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unMentionify = void 0;
const getSnowflakeNum_1 = __importDefault(require("../getSnowflakeNum"));
async function unMentionify(bot, str) {
    const regex = /<(@|#)[!@&]?\d+>/g;
    let strParts = [];
    let lastIndex = 0;
    for (let match; match = regex.exec(str);) {
        const snowflake = (0, getSnowflakeNum_1.default)(match[0]);
        if (!snowflake) {
            continue;
        }
        let replaceWith;
        if (match[1] == "#") {
            // channel
            const channel = await bot.client.getChannel(snowflake);
            if (!channel) {
                continue;
            }
            if (channel.isDMBased()) {
                replaceWith = "DM channel";
            }
            else {
                replaceWith = "#" + channel.name;
            }
        }
        else {
            const user = await bot.client.getUser(snowflake);
            if (!user) {
                continue;
            }
            replaceWith = "@" + user.username;
        }
        strParts.push(str.slice(lastIndex, match.index));
        strParts.push(replaceWith);
        lastIndex = match.index + match[0].length;
    }
    return strParts.join("") + str.slice(lastIndex);
}
exports.unMentionify = unMentionify;
