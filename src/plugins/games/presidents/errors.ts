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

class DMAlreadyLockedError extends Error {
    constructor() {
        super("DMs are already locked");
    }
}

class AlreadyJoinedError extends Error {
    constructor() {
        super("Player has already joined");
    }
}

export {
    MessageSyntaxError,
    MessageActionError,
    DMAlreadyLockedError,
    AlreadyJoinedError
};