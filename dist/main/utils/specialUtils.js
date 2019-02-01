"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fakeMessage(data) {
    return {
        author: data.author,
        channel: data.channel,
        guild: data.guild,
        content: data.content,
        createdTimestamp: Date.now()
    };
}
exports.fakeMessage = fakeMessage;
function mention(userId) {
    return "<@" + userId + ">";
}
exports.mention = mention;
