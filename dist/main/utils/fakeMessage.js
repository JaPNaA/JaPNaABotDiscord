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
exports.default = fakeMessage;
