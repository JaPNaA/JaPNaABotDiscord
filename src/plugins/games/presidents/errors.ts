class MessageSyntaxError extends Error {
    constructor(message?: string) {
        let str = "Message Syntax Error";
        if (message) { str += ": " + message; }

        super(str);
    }
}

class MessageActionError extends Error {
    constructor(message?: string) {
        let str = "Message Action Error";
        if (message) { str += ": " + message; }

        super(str);
    }
}

export { MessageActionError, MessageSyntaxError };
