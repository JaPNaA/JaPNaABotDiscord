/**
 * Class allowing flexible and complex unix-like command argument parsing
 * intended to replace utils/str/stringToArgs.ts
 */

type Checker = RegExp | ((str: string) => boolean);

export default class CommandArguments {
    constructor(private args: string) { }

    public parse(options: CommandArgumentParseOptions): CommandArgumentData {
        const strings = this.getStrings();
        const data = new CommandArgumentData(
            this._generateAliasMap(options),
            options.check || {},
            options.flags || [],
            options.exclutions || []
        );

        this._getNamedArgsAndFlags(strings, options, data);
        this._getOrderedArguments(strings, options, data);

        return data;
    }

    /**
     * Gets strings, split by space unless in quotes
     * - args = `1 2 '3 4'  "5 6"`
     * - returns ['1', '2', '3 4', '5 6']
     */
    public getStrings(): string[] {
        const strings = [];
        let string = "";
        let activeQuote = "";
        let escape = "";

        for (const char of this.args) {
            if (escape) {
                string += char;
                escape = "";
            } else if (!activeQuote && char === '"') {
                activeQuote = char;
            } else if (char === "\\") {
                escape = char;
            } else if (activeQuote === char) {
                activeQuote = "";
            } else if (char === " " && !activeQuote) {
                if (string) {
                    strings.push(string);
                }
                string = "";
            } else {
                string += char;
            }
        }

        if (activeQuote) {
            throw new Error("Unexpected unclosed quote");
        }

        if (string) {
            strings.push(string)
        }

        return strings;
    }

    public toString(): string {
        return this.args;
    }

    private _generateAliasMap(options: CommandArgumentParseOptions) {
        const map: { [x: string]: string } = {};
        for (const set of [options.namedOptions, options.flags]) {
            if (!set) { continue; }
            for (const aliases of set) {
                if (Array.isArray(aliases)) {
                    const key = aliases[0];
                    for (const alias of aliases) {
                        map[alias] = key;
                    }
                }
            }
        }
        return map;
    }

    private _getNamedArgsAndFlags(
        strings: string[],
        options: CommandArgumentParseOptions,
        data: CommandArgumentData
    ) {
        const namedOptions = options.namedOptions || [];
        const flags = options.flags || [];

        stringsLoop: for (let i = 0; i < strings.length; i++) {
            const string = strings[i];

            for (const optionNames of namedOptions) {
                const optionNamesArr =
                    Array.isArray(optionNames) ?
                        optionNames : [optionNames];

                for (const optionName of optionNamesArr) {
                    if (optionName.toLowerCase() === string.toLowerCase()) {
                        // remove strings from arguments; set next string as value
                        const val = strings.splice(i, 2)[1];
                        if (val === undefined) {
                            throw new Error(`Expected value after ${string}`);
                        }
                        data._setAfterCheck(optionName, val);
                        i--;
                        continue stringsLoop;
                    }
                }
            }

            for (const flagNames of flags) {
                const flagNamesArr =
                    Array.isArray(flagNames) ?
                        flagNames : [flagNames];

                for (const flagName of flagNamesArr) {
                    if (flagName.toLowerCase() === string.toLowerCase()) {
                        // remove flag from arguments; set flag to flag
                        data._setAfterCheck(flagName, strings.splice(i, 1)[0]);
                        i--;
                        continue stringsLoop;
                    }
                }
            }
        }
    }

    private _getOrderedArguments(
        strings: string[],
        options: CommandArgumentParseOptions,
        data: CommandArgumentData
    ) {
        const required = options.required || [];
        const remainingRequirements = required
            .filter(key => !data.has(key));

        const usableOverloads = options.overloads
            .filter(overload => {
                for (const req of remainingRequirements) {
                    if (!overload.includes(req)) { return false; }
                }
                return true;
            })
            .map(overload => overload.filter(arg => !data.has(arg)))
            .sort((a, b) => Math.abs(a.length - strings.length) - Math.abs(b.length - strings.length));

        let usableOverload = null;
        let usableStrings!: string[];

        overloadsLoop: for (const overload of usableOverloads) {
            const multifinalStrings = this._multifinalify(options.allowMultifinal, strings, overload.length);

            for (let i = 0; i < overload.length; i++) {
                if (
                    (
                        multifinalStrings[i] === undefined &&
                        required.includes(overload[i])
                    ) ||
                    !data._canSet(overload[i], multifinalStrings[i])[0]
                ) {
                    continue overloadsLoop;
                }
            }
            usableOverload = overload;
            usableStrings = multifinalStrings;
            break;
        }

        if (!usableOverload) {
            throw new Error("Invalid arguments");
        } else if (usableStrings.length > usableOverload.length) {
            throw new Error("Too many arguments");
        }

        for (let i = 0; i < usableOverload.length; i++) {
            data._set(usableOverload[i], usableStrings[i]);
        }
    }

    private _multifinalify(should: boolean | undefined, strings: string[], target: number): string[] {
        if (!should || strings.length <= target) { return strings; }
        const result = strings.slice(0, target - 1);
        result.push(strings.slice(target - 1).join(" "));
        return result;
    }
}

class CommandArgumentData {
    private obj: { [x: string]: string } = {};

    constructor(
        private argumentNameAliases: { [x: string]: string },
        private check: { [name: string]: Checker },
        private flags: (string | string[])[],
        private exclusions: string[][]
    ) { }

    public get(key: string) {
        return this.obj[this.dealias(key)];
    }

    public has(key: string) {
        return this.dealias(key) in this.obj;
    }

    public _setAfterCheck(key: string, value: string) {
        const canSet = this._canSet(key, value);
        if (!canSet[0]) {
            throw new Error(canSet[1]);
        }
        this._set(key, value);
    }

    public _set(key: string, value: string) {
        this.obj[this.dealias(key)] = value;
    }

    public _canSet(key: string, value: string): [false, string] | [true] {
        const dealiasedKey = this.dealias(key);

        // check exclusions
        for (const exclusionSet of this.exclusions) {
            if (exclusionSet.find(item => this.dealias(item) == dealiasedKey)) {
                for (const item of exclusionSet) {
                    if (this.dealias(item) in this.obj) {
                        return [false, `Cannot specify both ${item} and ${key}`];
                    }
                }
            }
        }

        const valLowercase = value.toLowerCase();
        // check to make sure flag keys have flag keys as values
        for (const flagSet of this.flags) {
            if (Array.isArray(flagSet)) {
                if (
                    flagSet.includes(dealiasedKey) &&
                    !flagSet.find(flag => flag.toLowerCase() === valLowercase)
                ) {
                    return [false, `Cannot assign to flag (${key})`]
                }
            }
        }

        if (key in this.check) {
            const checker = this.check[key];
            let valid;
            if (checker instanceof RegExp) {
                valid = checker.test(value);
            } else {
                valid = checker(value);
            }
            if (!valid) {
                return [false, `${key} cannot be ${value}`];
            }
        }

        return [true];
    }

    private dealias(name: string) {
        return this.argumentNameAliases[name] || name;
    }
}

interface CommandArgumentParseOptions {
    /**
     * List possible command argument orders (strings are argument names).
     * 
     * The best fitting overload will be used.
     */
    overloads: string[][],

    /**
     * Allow the last argument to be filled with the remaining strings
     *   ex. !spam 4 True i am spamming and counting
     *   with overloads [["times", "countEnabled", "message"]]
     *   will put "i am spamming and counting" in the message argument
     * 
     * False by default
     */
    allowMultifinal?: boolean,

    /**
     * Named options can be provided by the user in any order.
     *   ex. !set reminder 4 d --repeat-times 2 This reminder will ring 3
     *       times with a 4 day interval in between
     * 
     * For consistancy, try to start short named option names with '-' and
     * long names with '--'; ex. "-rt" and "--repeat-times"
     */
    namedOptions?: (string[] | string)[],

    /**
     * Flags are like namedOptions, but doesn't expect the next string to
     * be part of the option -- only existance is checked
     */
    flags?: (string[] | string)[],

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
        [name: string]: Checker
    },

    /**
     * Which arguments are required?
     */
    required?: string[],

    /**
     * List of options can't be specified together
     *   ex. [["--repeat", "--delay-sequence"]]
     *   will mark !set reminder --repeat --delay-sequence "4 5 2" invalid
     */
    exclutions?: string[][];
}
