import Bot from "../bot/bot";
declare type EventHandler = (bot: Bot, event: any) => void;
export default EventHandler;
