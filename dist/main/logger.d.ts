declare class Logger {
    static level: number;
    static log_message(...args: any[]): void;
    static log(...args: any[]): void;
    static warn(...args: any[]): void;
    static error(...args: any[]): void;
    /**
     * Sets the logging level
     * @param level 0 -> 4 logging level
     */
    static setLevel(level: number): void;
}
export default Logger;
