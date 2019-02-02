import path from "path";

/**
 * Creates a string from error
 * @param error to convert to string
 * @returns error string
 */
function createErrorString(error: Error): string {
    let str: string | undefined = error.stack;

    if (require.main && str) {
        str = str.split(path.dirname(require.main.filename)).join(".");
    } else {
        str = "Error generating error string. How ironic.";
    }

    return str;
}

export default createErrorString