"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeFormattingChars(str) {
    return str.replace(/(~~|\*\*|\*|__|_|\[|\])(.+?)\1/g, (_f, formattingChar, content) => formattingChar === "~~" ? "" : content);
}
exports.default = removeFormattingChars;
