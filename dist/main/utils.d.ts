/**
 * Checks if string starts with any of array
 * @param string to test
 * @param arr array of possible starts
 * @returns what item of array string started with
 */
declare function startsWithAny(string: string, arr: string[]): string | null;
export { startsWithAny };
/**
 * Converts string to array of arguments
 * @param string string to convert
 * @returns arguments
 */
declare function stringToArgs(string: string): string[];
export { stringToArgs };
/**
 * Generates a random number with parameters
 * @param Number min value
 * @param max max value
 * @param step always divisible by
 * @returns generated
 */
declare function random(min?: number, max?: number, step?: number): number;
export { random };
/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
declare function getBit(int: number, pos: number): boolean;
export { getBit };
/**
 * Gets userId from string
 * @param id user id as argument
 * @returns id
 */
declare function getSnowflakeNum(id: string): string | null;
export { getSnowflakeNum };
/**
 * Creates a string from error
 * @param error to convert to string
 * @returns error string
 */
declare function createErrorString(error: Error): string;
export { createErrorString };
/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
declare function tryRun(func: Function): string | null;
export { tryRun };
/**
 * Converts element into element array if required
 */
declare function toArray<T>(element: T | T[]): T[];
export { toArray };
