module.exports = {
    /**
     * Checks if string starts with any of array
     * @param {String} string to test
     * @param {String[]} arr array of possible starts
     * @returns {String} what item of array string started with
     */
    startsWithAny(string, arr) {
        for (let i of arr) {
            if (string.startsWith(i)) {
                return i;
            }
        }
        return null;
    }
};