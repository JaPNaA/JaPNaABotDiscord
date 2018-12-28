import * as jbot from "./index.js";

const MEMORY_PATH = "./data/memory.json";
const CONFIG_PATH = "./data/config.jsonc";
const ENV_PATH = "./data/.env";

/** get environment variables */
import ENVFunc from "./readenv.js";
const ENV = ENVFunc(ENV_PATH);

jbot.start(ENV.token, CONFIG_PATH, MEMORY_PATH);
jbot.registerAutoloadBuiltinPlugin("japnaa_weird");

// gacefully stop on ctrl-c
process.on("SIGINT", function () {
    jbot.stop(10000)
        .then(() => process.exit(0));
});