"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wait(ms) {
    return new Promise(res => setInterval(() => res(), ms));
}
exports.default = wait;
