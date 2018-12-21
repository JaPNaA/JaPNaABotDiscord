class Logger {
    static level: number = 0;

    static log_message(...args: any[]) {
        if (Logger.level >= 4) {
            console.log(...args);
        }
    }

    static log(...args: any[]) {
        if (Logger.level >= 3) {
            console.log(...args);
        }
    }

    static warn(...args: any[]) {
        if (Logger.level >= 2) {
            console.warn(...args);
        }
    }

    static error(...args: any[]) {
        if (Logger.level >= 1) {
            console.error(...args);
        }
    }

    /**
     * Sets the logging level
     * @param level 0 -> 4 logging level
     */
    static setLevel(level: number) {
        Logger.level = level;
    }
}

export default Logger;