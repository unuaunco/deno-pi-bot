import { BotRoute, BotRouter } from "./models/Router.ts";
import { BotViews } from './views.ts';
import { TelegramBot } from "https://deno.land/x/telegram_bot_api/mod.ts";
import bot from './botInit.ts';

const views = new BotViews(bot);

const straightRoutes: BotRoute[] = [
    { routeName: views.dialogs.start.label, functionInstance: views.register },
    { routeName: views.dialogs.stop.label, functionInstance: views.removeUser }, 
    { routeName: views.dialogs.cacheOut.label, functionInstance: views.insertOutSum }, 
    { routeName: views.dialogs.cacheIn.label, functionInstance: views.insertInSum }, 
    { routeName: 'default', functionInstance: views.returnActions }, 

];

const callbackRoutes: BotRoute[] = [
    { routeName: 'default', functionInstance: views.callbackActions },
];

export const callbackRouter = new BotRouter(callbackRoutes);

export const straightRouter = new BotRouter(straightRoutes);
