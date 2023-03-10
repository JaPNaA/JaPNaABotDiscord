"use strict";
// This file is purely for backwards compatibility reasons
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryRun = exports.toOne = exports.toArray = exports.stringToArgs = exports.startsWithAny = exports.random = exports.getSnowflakeNum = exports.getBit = exports.createErrorString = void 0;
const createErrorString_1 = __importDefault(require("./str/createErrorString"));
exports.createErrorString = createErrorString_1.default;
const getBit_1 = __importDefault(require("./getBit"));
exports.getBit = getBit_1.default;
const getSnowflakeNum_1 = __importDefault(require("./getSnowflakeNum"));
exports.getSnowflakeNum = getSnowflakeNum_1.default;
const random_1 = __importDefault(require("./random/random"));
exports.random = random_1.default;
const startsWithAny_1 = __importDefault(require("./str/startsWithAny"));
exports.startsWithAny = startsWithAny_1.default;
const stringToArgs_1 = __importDefault(require("./str/stringToArgs"));
exports.stringToArgs = stringToArgs_1.default;
const toArray_1 = __importDefault(require("./toArray"));
exports.toArray = toArray_1.default;
const toOne_1 = __importDefault(require("./toOne"));
exports.toOne = toOne_1.default;
const tryRun_1 = __importDefault(require("./tryRun"));
exports.tryRun = tryRun_1.default;
