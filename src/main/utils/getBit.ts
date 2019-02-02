/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
function getBit(int: number, pos: number): boolean {
    return Boolean(int >> pos & 1);
}

export default getBit;