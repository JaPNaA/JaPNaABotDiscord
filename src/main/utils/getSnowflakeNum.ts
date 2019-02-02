/**
 * Gets userId from string
 * @param id user id as argument
 * @returns id
 */
function getSnowflakeNum(id: string): string | null {
    let matches: RegExpMatchArray | null = id.match(/\d{7,}/);
    if (matches) {
        return matches[0];
    }
    return null;
}

export default getSnowflakeNum;