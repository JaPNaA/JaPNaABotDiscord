"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generates a random number with parameters
 * @param Number min value
 * @param max max value
 * @param step always divisible by
 * @returns generated
 */
function random(min = 0, max = 1, step = 0) {
    if (step) { // step is not 0
        let smin = Math.floor(min / step);
        let smax = Math.floor(max / step) + 1;
        return step * Math.floor(smin + Math.random() * (smax - smin));
    }
    else if (step === 1) { // optimize for 1
        return Math.floor(min + Math.random() * (max - min));
    }
    else { // step is 0, no step, default
        return min + Math.random() * (max - min);
    }
}
exports.default = random;
