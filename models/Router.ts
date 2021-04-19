import type { Message,  CallbackQuery} from "https://deno.land/x/telegram_bot_api/mod.ts";
import { TelegramBot } from "https://deno.land/x/telegram_bot_api/mod.ts";

export interface BotRoute {
  routeName: string;
  functionInstance: any;
}

export class BotRouter {
  routes: BotRoute[];
  views: any;

  constructor(
      routes: BotRoute[],
      viewsObject: any) {
    this.routes = routes;
    this.views = viewsObject
  }

  async runRoute(routeName: string, message: any): Promise<boolean> {
    let ret: boolean;
    ret = false;
    for (let index = 0; index < this.routes.length; index++) {
        const route = this.routes[index];
        if (route.routeName === routeName) {
            await route.functionInstance.call(this.views, message);
            ret = true;
            break;
        }
    }
    return ret;
  }
}