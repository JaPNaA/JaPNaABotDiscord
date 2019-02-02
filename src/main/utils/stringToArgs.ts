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

export default stringToArgs;