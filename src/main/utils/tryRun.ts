import createErrorString from "./str/createErrorString";

/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
async function tryRun(func: Function): Promise<string | null> {
    try {
        await func();
    } catch (error) {
        return createErrorString(error as Error);
    }
    return null;
}

export default tryRun;