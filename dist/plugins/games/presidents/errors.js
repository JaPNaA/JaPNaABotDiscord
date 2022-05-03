"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSyntaxError = exports.MessageActionError = void 0;
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
