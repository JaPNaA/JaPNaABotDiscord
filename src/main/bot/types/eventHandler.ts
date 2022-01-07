import Bot from "../bot/bot";

type EventHandler = (bot: Bot, event: any) => void;

export default EventHandler;