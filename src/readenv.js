const FS = require("fs");

/**
 * Read ENV file
 * @param {String} path to env file
 */
function readEnv(path) {
    const lines = FS.readFileSync(path).toString().split("\n");
    const obj = {};

    for (const line of lines) {
        if (line.match(/^\s*#/) || line.match(/^\s*$/)) continue;
        const [key, value] = line.split("=");
        obj[key] = value;
    }

    return obj;
}

module.exports = readEnv;