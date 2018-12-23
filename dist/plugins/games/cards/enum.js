"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Enum {
    constructor(...keys) {
        this.map = {};
        this.keys = [];
        this.size = 0;
        for (let key of keys) {
            this.add(key);
        }
    }
    add(val) {
        let index = this.size;
        this.map[val] = index;
        this.keys.push(val);
    }
    get(val) {
        return this.map[val];
    }
}
exports.default = Enum;
