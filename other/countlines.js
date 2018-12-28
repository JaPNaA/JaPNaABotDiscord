const FS = require("fs");
const PATH = require("path");

let totalLines = 0;
let longestPathLength = 0;
let mostLines = 0;
let allFiles = [];

function countLines(path) {
    const file = FS. readFileSync(path).toString();
    const numberOfLines = file.split("\n").length;

    totalLines += numberOfLines;

    if (path.length > longestPathLength) {
        longestPathLength = path.length;
    }

    if (numberOfLines > mostLines) {
        mostLines = numberOfLines;
    }

    allFiles.push([path, numberOfLines]);
}

function countDir(path) {
    const dir = FS.readdirSync(path);

    for (let item of dir) {
        let npath = PATH.join(path, item);
        if (FS.statSync(npath).isDirectory()) {
            countDir(npath);
        } else {
            countLines(npath);
        }
    }
}

countDir("../src");

let mostLinesB10Length = Math.ceil(Math.log10(mostLines));

console.log(allFiles.map(e => {
    let name = e[0];
    let len = e[1];

    name = name.padStart(longestPathLength, " ");
    len = len.toString().padStart(mostLinesB10Length, " ");

    return name + ": " + len;
}).join("\n"));

console.log("\n");

console.log("TOTAL LINES:", totalLines);