/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
function getBit(int: bigint, pos: bigint): boolean {
    return Boolean(int >> pos & 1n);
}

export default getBit;