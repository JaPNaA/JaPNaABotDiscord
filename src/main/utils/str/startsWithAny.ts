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

export default startsWithAny;