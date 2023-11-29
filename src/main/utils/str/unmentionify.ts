import Bot from "../../bot/bot/bot";
import getSnowflakeNum from "../getSnowflakeNum";

export async function unMentionify(bot: Bot, str: string): Promise<string> {
    const regex = /<(@|#)[!@&]?\d+>/g;
    let strParts = [];
    let lastIndex = 0;

    for (let match; match = regex.exec(str);) {
        const snowflake = getSnowflakeNum(match[0]);
        if (!snowflake) { continue; }
        let replaceWith;
        if (match[1] == "#") {
            // channel
            const channel = await bot.client.getChannel(snowflake);
            if (!channel) { continue; }

            if (channel.isDMBased()) {
                replaceWith = "DM channel";
            } else {
                replaceWith = "#" + channel.name;
            }
        } else {
            const user = await bot.client.getUser(snowflake);
            if (!user) { continue; }

            replaceWith = "@" + user.username;
        }
        strParts.push(str.slice(lastIndex, match.index));
        strParts.push(replaceWith);
        lastIndex = match.index + match[0].length;
    }

    return strParts.join("") + str.slice(lastIndex);
}