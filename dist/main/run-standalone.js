"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jbot = __importStar(require("./index.js"));
const MEMORY_PATH = "./data/memory.json";
const CONFIG_PATH = "./data/config.jsonc";
const ENV_PATH = "./data/.env";
/** get environment variables */
const readenv_js_1 = __importDefault(require("./utils/readenv.js"));
const ENV = (0, readenv_js_1.default)(ENV_PATH);
jbot.start(ENV.token, CONFIG_PATH, MEMORY_PATH);
jbot.registerAutoloadBuiltinPlugin("japnaa_weird");
// gacefully stop on ctrl-c
process.on("SIGINT", function () {
    jbot.stop(10000)
        .then(() => process.exit(0));
});
