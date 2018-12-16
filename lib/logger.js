class Logger {
    static log_message(...args) {
        if (Logger.level >= 4) {
            console.log(...args);
        }
    }

    static log(...args) {
        if (Logger.level >= 3) {
            console.log(...args);
        }
    }

    static warn(...args) {
        if (Logger.level >= 2) {
            console.warn(...args);
        }
    }

    static error(...args) {
        if (Logger.level >= 1) {
            console.error(...args);
        }
    }

    /**
     * Sets the logging level
     * @param {Number} level 0 -> 4 logging level
     */
    static setLevel(level) {
        Logger.level = level;
    }
}

Logger.level = 0;

module.exports = Logger;