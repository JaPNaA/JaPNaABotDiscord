/**
 * Read ENV file
 * @param path to env file
 */
declare function readEnv(path: string): {
    [x: string]: string;
};
export default readEnv;
