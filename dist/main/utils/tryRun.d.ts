/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
declare function tryRun(func: Function): string | null;
export default tryRun;
