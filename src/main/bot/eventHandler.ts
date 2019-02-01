import BotHooks from "./botHooks";

type EventHandler = (botHooks: BotHooks, event: any) => void;

export default EventHandler;