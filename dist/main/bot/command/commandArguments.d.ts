/**
 * Class allowing flexible and complex unix-like command argument parsing
 * intended to replace utils/str/stringToArgs.ts
 */
declare type Checker = RegExp | ((str: string) => boolean);
export default class CommandArguments {
    private args;
    constructor(args: string);
    parse(options: CommandArgumentParseOptions): CommandArgumentData;
    /**
     * Gets strings, split by space unless in quotes
     * - args = `1 2 '3 4'  "5 6"`
     * - returns ['1', '2', '3 4', '5 6']
     */
    getStrings(): string[];
    toString(): string;
    private _generateAliasMap;
    private _getNamedArgsAndFlags;
    private _getOrderedArguments;
    private _multifinalify;
}
declare class CommandArgumentData {
    private argumentNameAliases;
    private check;
    private flags;
    private exclusions;
    private obj;
    constructor(argumentNameAliases: {
        [x: string]: string;
    }, check: {
        [name: string]: Checker;
    }, flags: (string | string[])[], exclusions: string[][]);
    get(key: string): string;
    has(key: string): boolean;
    _setAfterCheck(key: string, value: string): void;
    _set(key: string, value: string): void;
    _canSet(key: string, value: string): [false, string] | [true];
    private dealias;
}
interface CommandArgumentParseOptions {
    /**
     * List possible command argument orders (strings are argument names).
     *
     * The best fitting overload will be used.
     */
    overloads: string[][];
    /**
     * Allow the last argument to be filled with the remaining strings
     *   ex. !spam 4 True i am spamming and counting
     *   with overloads [["times", "countEnabled", "message"]]
     *   will put "i am spamming and counting" in the message argument
     *
     * False by default
     */
    allowMultifinal?: boolean;
    /**
     * Named options can be provided by the user in any order.
     *   ex. !set reminder 4 d --repeat-times 2 This reminder will ring 3
     *       times with a 4 day interval in between
     *
     * For consistancy, try to start short named option names with '-' and
     * long names with '--'; ex. "-rt" and "--repeat-times"
     */
    namedOptions?: (string[] | string)[];
    /**
     * Flags are like namedOptions, but doesn't expect the next string to
     * be part of the option -- only existance is checked
     */
    flags?: (string[] | string)[];
    /**
     * Check the user arguments?
     *
     * Format:
     *     { [name]: RegExp }
     *   - name is the name of the argument provided
     *   - string is the type of argument expected, add ? to end to indicate
     *     optional
     */
    check?: {
        [name: string]: Checker;
    };
    /**
     * Which arguments are required?
     */
    required?: string[];
    /**
     * List of options can't be specified together
     *   ex. [["--repeat", "--delay-sequence"]]
     *   will mark !set reminder --repeat --delay-sequence "4 5 2" invalid
     */
    exclutions?: string[][];
}
export {};
