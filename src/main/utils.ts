import PATH from "path";

/**
 * Checks if string starts with any of array
 * @param string to test
 * @param arr array of possible starts
 * @returns what item of array string started with
 */
function startsWithAny(string: string, arr: string[]): string | null {
    for (let i of arr) {
        if (string.startsWith(i)) {
            return i;
        }
    }
    return null;
}

export { startsWithAny };

/**
 * Converts string to array of arguments
 * @param string string to convert
 * @returns arguments
 */
function stringToArgs(string: string): string[] {
    return string
        .split(/\s+/) // split at every space
        .filter(e => e); // remove any empty
}

export { stringToArgs };

/**
 * Generates a random number with parameters
 * @param Number min value
 * @param max max value
 * @param step always divisible by
 * @returns generated
 */
function random(min: number = 0, max: number = 1, step: number = 0): number {
    if (step) { // step is not 0
        let smin = Math.floor(min / step);
        let smax = Math.floor(max / step) + 1;
        return step * Math.floor(smin + Math.random() * (smax - smin));
    } else if (step === 1) { // optimize for 1
        return Math.floor(min + Math.random() * (max - min));
    } else { // step is 0, no step, default
        return min + Math.random() * (max - min);
    }
}

export { random };

/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
function getBit(int: number, pos: number): boolean {
    return Boolean(int >> pos & 1);
}

export { getBit };

/**
 * Gets userId from string
 * @param id user id as argument
 * @returns id
 */
function getSnowflakeNum(id: string) : string | null {
    let matches = id.match(/\d{7,}/);
    if (matches) {
        return matches[0];
    }
    return null;
}

export { getSnowflakeNum };

/**
 * Creates a string from error
 * @param error to convert to string
 * @returns error string
 */
function createErrorString(error: Error): string {
    let str = error.stack;

    if (require.main && str) {
        str = str.split(PATH.dirname(require.main.filename)).join(".");
    } else {
        str = "Error generating error string. How ironic."
    }
    
    return str;
}

export { createErrorString };

/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
function tryRun(func: Function) {
    try {
        func();
    } catch (error) {
        return createErrorString(error);
    }
    return null;
}

export { tryRun };