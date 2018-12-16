module.exports = {
    /**
     * Checks if string starts with any of array
     * @param {String} string to test
     * @param {String[]} arr array of possible starts
     * @returns {String|null} what item of array string started with
     */
    startsWithAny(string, arr) {
        for (let i of arr) {
            if (string.startsWith(i)) {
                return i;
            }
        }
        return null;
    },

    /**
     * Converts string to array of arguments
     * @param {String} string string to convert
     * @returns {String[]} arguments
     */
    stringToArgs(string) {
        return string
            .split(/\s+/) // split at every space
            .filter(e => e); // remove any empty
    },

    /**
     * Generates a random number with parameters
     * @param {Number} [min = 0] min value
     * @param {Number} [max = 1] max value
     * @param {Number} [step = 0] always divisible by
     * @returns {Number} generated
     */
    random(min = 0, max = 1, step = 0) {
        if (step) { // step is not 0
            let smin = Math.floor(min / step);
            let smax = Math.floor(max / step) + 1;
            return step * Math.floor(smin + Math.random() * (smax - smin));
        } else if (step === 1) { // optimize for 1
            return Math.floor(min + Math.random() * (max - min));
        } else { // step is 0, no step, default
            return min + Math.random() * (max - min);
        }
    },

    /**
     * Gets bit from int
     * @param {Number} int integer to get bit of
     * @param {Number} pos position of bit
     * @returns {Boolean} bit
     */
    getBit(int, pos) {
        return Boolean(int >> pos & 1);
    },

    /**
     * Gets userId from string
     * @param {String} id user id as argument
     * @returns {String|null} id
     */
    getSnowflakeNum(id) {
        let matches = id.match(/\d{7,}/);
        if (matches) {
            return matches[0];
        }
        return null;
    }
};