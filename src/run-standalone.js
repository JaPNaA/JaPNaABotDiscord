const jbot = require("./index.js");

const MEMORY_PATH = "./data/memory.json";
const CONFIG_PATH = "./data/config.jsonc";
const ENV_PATH = "./data/.env";

/** get environment variables */
const ENV = require("./readenv.js")(ENV_PATH);

jbot.start(ENV.token, CONFIG_PATH, MEMORY_PATH);
jbot.loadBuiltinPlugin("japnaa_weird");

// gacefully stop on ctrl-c
process.on("SIGINT", function () {
    jbot.stop(10000)
        .then(() => process.exit(0));
});