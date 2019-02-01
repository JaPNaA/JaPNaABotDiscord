"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
const ENV = readenv_js_1.default(ENV_PATH);
jbot.start(ENV.token, CONFIG_PATH, MEMORY_PATH);
jbot.registerAutoloadBuiltinPlugin("japnaa_weird");
// gacefully stop on ctrl-c
process.on("SIGINT", function () {
    jbot.stop(10000)
        .then(() => process.exit(0));
});
