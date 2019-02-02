function ellipsisize(str: string, length: number) {
    if (str.length > length) {
        return str.slice(0, length - 3) + "...";
    } else {
        return str;
    }
}

export default ellipsisize;