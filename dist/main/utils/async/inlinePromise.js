"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function inlinePromise() {
    let res;
    const promise = new Promise(r => res = r);
    return { promise, res };
}
exports.default = inlinePromise;
