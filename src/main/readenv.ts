import FS from "fs";

/**
 * Read ENV file
 * @param path to env file
 */
function readEnv(path: string): { [x: string]: string } {
    const lines = FS.readFileSync(path).toString().split("\n");
    const obj: {
        [x: string]: string
    } = {};

    for (const line of lines) {
        if (line.match(/^\s*#/) || line.match(/^\s*$/)) continue;
        const [key, value] = line.split("=");
        obj[key] = value;
    }

    return obj;
}

export default readEnv;