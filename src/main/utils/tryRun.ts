import createErrorString from "./str/createErrorString";

/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
function tryRun(func: Function): string | null {
    try {
        func();
    } catch (error) {
        return createErrorString(error);
    }
    return null;
}

export default tryRun;