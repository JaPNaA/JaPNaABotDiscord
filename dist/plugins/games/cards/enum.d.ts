declare class Enum {
    private map;
    private size;
    keys: string[];
    constructor(...keys: string[]);
    add(val: string): void;
    get(val: string): number;
}
export default Enum;
