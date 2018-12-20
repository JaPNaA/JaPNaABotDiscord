declare class Logger {
    static log_message(...args: {}): void;
    static log(...args: {}): void;
    static warn(...args: {}): void;
    static error(...args: {}): void;
    /**
     * Sets the logging level
     * @param {Number} level 0 -> 4 logging level
     */
    static setLevel(level: any): void;
}
