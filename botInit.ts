
import { InlineKeyboardButton, TelegramBot, UpdateType } from "./deps.ts";

const TOKEN = Deno.env.get("TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

export default bot;