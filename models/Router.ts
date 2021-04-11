import type { Message,  CallbackQuery} from "https://deno.land/x/telegram_bot_api/mod.ts";
import { TelegramBot } from "https://deno.land/x/telegram_bot_api/mod.ts";

export interface BotRoute {
  routeName: string;
  functionInstance: (...args: any[]) => Promise<void>;
}

export class BotRouter {
  routes: BotRoute[];

  constructor(routes: BotRoute[]) {
    this.routes = routes;
  }

  runRoute(routeName: string, ...args: any[]): boolean {
    this.routes.forEach(async (route) => {
      if (route.routeName === routeName) {
        await route.functionInstance(args);
        return true;
      }
    });
    return false;
  }
}