import BotHooks from "../bot/botHooks";

type EventHandler = (botHooks: BotHooks, event: any) => void;

export default EventHandler;