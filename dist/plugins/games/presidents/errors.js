"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlreadyJoinedError = exports.DMAlreadyLockedError = exports.MessageActionError = exports.MessageSyntaxError = void 0;
class MessageSyntaxError extends Error {
    constructor(message) {
        let str = "Message Syntax Error";
        if (message) {
            str += ": " + message;
        }
        super(str);
    }
}
exports.MessageSyntaxError = MessageSyntaxError;
class MessageActionError extends Error {
    constructor(message) {
        let str = "Message Action Error";
        if (message) {
            str += ": " + message;
        }
        super(str);
    }
}
exports.MessageActionError = MessageActionError;
class DMAlreadyLockedError extends Error {
    constructor() {
        super("DMs are already locked");
    }
}
exports.DMAlreadyLockedError = DMAlreadyLockedError;
class AlreadyJoinedError extends Error {
    constructor() {
        super("Player has already joined");
    }
}
exports.AlreadyJoinedError = AlreadyJoinedError;
