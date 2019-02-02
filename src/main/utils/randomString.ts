import random from "./random";

function randomString(length: number): string {
    const min: number = 32;
    const max: number = 127;
    let rands: number[] = [];

    for (let i: number = 0; i < length; i++) {
        rands.push(random(min, max, 1));
    }

    return String.fromCharCode(...rands);
}

export default randomString;