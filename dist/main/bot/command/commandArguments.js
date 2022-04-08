"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class allowing flexible and complex unix-like command argument parsing
 * intended to replace utils/str/stringToArgs.ts
 */
class CommandArguments {
    args;
    constructor(args) {
        this.args = args;
    }
    parse(options) {
        const strings = this.getStrings();
        const data = new CommandArgumentData(this._generateAliasMap(options), options.check || {}, options.exclutions || []);
        this._getNamedArgsAndFlags(strings, options, data);
        this._getOrderedArguments(strings, options, data);
        return data;
    }
    /**
     * Gets strings, split by space unless in quotes
     * - args = `1 2 '3 4'  "5 6"`
     * - returns ['1', '2', '3 4', '5 6']
     */
    getStrings() {
        const strings = [];
        let string = "";
        let activeQuote = "";
        let escape = "";
        for (const char of this.args) {
            if (escape) {
                string += char;
                escape = "";
            }
            else if (!activeQuote && char === '"') {
                activeQuote = char;
            }
            else if (char === "\\") {
                escape = char;
            }
            else if (activeQuote === char) {
                activeQuote = "";
            }
            else if (char === " " && !activeQuote) {
                if (string) {
                    strings.push(string);
                }
                string = "";
            }
            else {
                string += char;
            }
        }
        if (activeQuote) {
            throw new Error("Unexpected unclosed quote");
        }
        if (string) {
            strings.push(string);
        }
        return strings;
    }
    toString() {
        return this.args;
    }
    _generateAliasMap(options) {
        const map = {};
        for (const set of [options.namedOptions, options.flags]) {
            if (!set) {
                continue;
            }
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
    _getNamedArgsAndFlags(strings, options, data) {
        const namedOptions = options.namedOptions || [];
        const flags = options.flags || [];
        stringsLoop: for (let i = 0; i < strings.length; i++) {
            const string = strings[i];
            for (const optionNames of namedOptions) {
                const optionNamesArr = Array.isArray(optionNames) ?
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
                const flagNamesArr = Array.isArray(flagNames) ?
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
    _getOrderedArguments(strings, options, data) {
        const required = options.required || [];
        const remainingRequirements = required
            .filter(key => !data.has(key));
        const usableOverloads = options.overloads
            .filter(overload => {
            for (const req of remainingRequirements) {
                if (!overload.includes(req)) {
                    return false;
                }
            }
            return true;
        })
            .map(overload => overload.filter(arg => !data.has(arg)))
            .sort((a, b) => Math.abs(a.length - strings.length) - Math.abs(b.length - strings.length));
        let usableOverload = null;
        let usableStrings;
        overloadsLoop: for (const overload of usableOverloads) {
            const multifinalStrings = this._multifinalify(options.allowMultifinal, strings, overload.length);
            for (let i = 0; i < overload.length; i++) {
                if ((multifinalStrings[i] === undefined &&
                    required.includes(overload[i])) ||
                    !data._canSet(overload[i], multifinalStrings[i])[0]) {
                    continue overloadsLoop;
                }
            }
            usableOverload = overload;
            usableStrings = multifinalStrings;
            break;
        }
        if (!usableOverload) {
            throw new Error("Invalid arguments");
        }
        else if (usableStrings.length > usableOverload.length) {
            throw new Error("Too many arguments");
        }
        for (let i = 0; i < usableOverload.length; i++) {
            data._set(usableOverload[i], usableStrings[i]);
        }
    }
    _multifinalify(should, strings, target) {
        if (!should || strings.length <= target) {
            return strings;
        }
        const result = strings.slice(0, target - 1);
        result.push(strings.slice(target - 1).join(" "));
        return result;
    }
}
exports.default = CommandArguments;
class CommandArgumentData {
    argumentNameAliases;
    check;
    exclusions;
    obj = {};
    constructor(argumentNameAliases, check, exclusions) {
        this.argumentNameAliases = argumentNameAliases;
        this.check = check;
        this.exclusions = exclusions;
    }
    get(key) {
        return this.obj[this.dealias(key)];
    }
    has(key) {
        return this.dealias(key) in this.obj;
    }
    _setAfterCheck(key, value) {
        const canSet = this._canSet(key, value);
        if (!canSet[0]) {
            throw new Error(canSet[1]);
        }
        this._set(key, value);
    }
    _set(key, value) {
        this.obj[this.dealias(key)] = value;
    }
    _canSet(key, value) {
        const dealiasedKey = this.dealias(key);
        for (const exclusionSet of this.exclusions) {
            if (exclusionSet.find(item => this.dealias(item) == dealiasedKey)) {
                for (const item of exclusionSet) {
                    if (this.dealias(item) in this.obj) {
                        return [false, `Cannot specify both ${item} and ${key}`];
                    }
                }
            }
        }
        if (key in this.check) {
            if (!this.check[key].test(value)) {
                return [false, `${key} cannot be ${value}`];
            }
        }
        return [true];
    }
    dealias(name) {
        return this.argumentNameAliases[name] || name;
    }
}
