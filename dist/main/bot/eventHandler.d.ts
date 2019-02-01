import BotHooks from "./botHooks";
declare type EventHandler = (botHooks: BotHooks, event: any) => void;
export default EventHandler;
