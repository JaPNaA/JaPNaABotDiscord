import * as jbot from "./index";
import randomString from "./utils/randomString";

const debugPrecommand = randomString(12) + " ";

console.log("Debug precommand: " + debugPrecommand);
console.log("The bot will only respond to this command while in debug mode");

const config = jbot.getDefaultConfig();

config.__debug = true;
config.__debugPrecommand = debugPrecommand;