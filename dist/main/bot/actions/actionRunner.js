"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRunner = void 0;
const node_util_1 = require("node:util");
const allUtils_1 = require("../../utils/allUtils");
const logger_1 = __importDefault(require("../../utils/logger"));
const actions_1 = require("./actions");
class ActionRunner {
    bot;
    constructor(bot) {
        this.bot = bot;
    }
    /** Tries to run command, and sends an error message if fails */
    async run(generator, messageEvent, interaction) {
        const wrapped = this.generatorWrapper(generator, messageEvent);
        for await (const action of wrapped) {
            if (interaction) {
                await action.performInteraction(this.bot, interaction);
            }
            else {
                await action.perform(this.bot, messageEvent);
            }
        }
    }
    async *generatorWrapper(generator, messageEvent) {
        try {
            let result;
            do {
                result = await generator.next();
                const action = result.value;
                if (action instanceof actions_1.Action) {
                    yield action;
                }
                else if (action) {
                    yield new actions_1.ReplySoft(action);
                }
            } while (!result.done);
        }
        catch (error) {
            yield this.getErrorAction(messageEvent, error);
        }
    }
    getErrorAction(messageEvent, error) {
        const errorStr = (0, allUtils_1.createErrorString)(error);
        const messageShort = "An error occured\n```" + error.message;
        const messageLong = "```An error occured" +
            "\nEvent: " + (0, node_util_1.inspect)(messageEvent, { depth: 3 }) +
            "\n" + errorStr;
        logger_1.default.warn(messageLong);
        return new actions_1.ReplySoft(messageShort.slice(0, 1997) + "```");
    }
}
exports.ActionRunner = ActionRunner;
