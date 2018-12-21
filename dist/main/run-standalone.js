"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = __importDefault(require("./index.js"));
const MEMORY_PATH = "./data/memory.json";
const CONFIG_PATH = "./data/config.jsonc";
const ENV_PATH = "./data/.env";
/** get environment variables */
const readenv_js_1 = __importDefault(require("./readenv.js"));
const ENV = readenv_js_1.default(ENV_PATH);
index_js_1.default.start(ENV.token, CONFIG_PATH, MEMORY_PATH);
index_js_1.default.registerAutoloadBuiltinPlugin("japnaa_weird");
// gacefully stop on ctrl-c
process.on("SIGINT", function () {
    index_js_1.default.stop(10000)
        .then(() => process.exit(0));
});
