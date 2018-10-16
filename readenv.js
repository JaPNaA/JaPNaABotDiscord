const FS = require("fs");

function readEnv() {
    const lines = FS.readFileSync("./.env").toString().split("\n");
    const obj = {};

    for (const line of lines) {
        const [key, value] = line.split("=");
        obj[key] = value;
    }

    return obj;
}

module.exports = readEnv;