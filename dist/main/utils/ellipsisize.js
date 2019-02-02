"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ellipsisize(str, length) {
    if (str.length > length) {
        return str.slice(0, length - 3) + "...";
    }
    else {
        return str;
    }
}
exports.default = ellipsisize;
