/// <reference types="node" />
declare const PATH: any;
declare const Utils: {
    /**
     * Checks if string starts with any of array
     * @param string to test
     * @param arr array of possible starts
     * @returns what item of array string started with
     */
    startsWithAny(string: string, arr: {}): string | null;
    /**
     * Converts string to array of arguments
     * @param string string to convert
     * @returns arguments
     */
    stringToArgs(string: string): {};
    /**
     * Generates a random number with parameters
     * @param Number min value
     * @param max max value
     * @param step always divisible by
     * @returns generated
     */
    random(min?: number, max?: number, step?: number): number;
    /**
     * Gets bit from int
     * @param int integer to get bit of
     * @param pos position of bit
     * @returns bit
     */
    getBit(int: number, pos: number): boolean;
    /**
     * Gets userId from string
     * @param id user id as argument
     * @returns id
     */
    getSnowflakeNum(id: string): string | null;
    /**
     * Creates a string from error
     * @param error to convert to string
     * @returns error string
     */
    createErrorString(error: Error): string;
    /**
     * Tries to run a function
     * @param {Function} func function to try to run
     * @returns {String | null} error message, if any
     */
    tryRun(func: any): string | null;
};
