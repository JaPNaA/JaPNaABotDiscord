const FS = require("fs");

function readEnv() {
    const lines = FS.readFileSync("./data/.env").toString().split("\n");
    const obj = {};

    for (const line of lines) {
        if (line.match(/^\s*#/) || line.match(/^\s*$/)) continue;
        const [key, value] = line.split("=");
        obj[key] = value;
    }

    return obj;
}

module.exports = readEnv;