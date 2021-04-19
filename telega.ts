/**
 * Try the example right from the terminal
 * MacOS, Linux $:
 * TOKEN=1719600856:AAGskvdjxn7FOJ3kzPXvlZJO_8WxD-1ZTkc deno run --allow-net --allow-env https://deno.land/x/telegram_bot_api/examples/01-polling.ts
 * Windows $:
 * $env:TOKEN="1719600856:AAGskvdjxn7FOJ3kzPXvlZJO_8WxD-1ZTkc"; deno run --allow-net --allow-env --allow-read telega.ts
 */

import db from "./database.ts";
import { InlineKeyboardButton, TelegramBot, UpdateType } from "./deps.ts";

import { DialogFlow, Storage, Transaction, User } from "./models/import.ts";

import { createHash } from "https://deno.land/std@0.82.0/hash/mod.ts";

/**
   * This example shows how to run bot using long polling mechanism.
   * Polling parameter accepts the same parameters like described in docs
   * @see https://core.telegram.org/bots/api#getupdates.
   * Or just pass `true`, then polling will be run with bot default parameters:
   * {
   *   timeout: 30,
   * }
   */

import bot from './botInit.ts';

import { straightRouter, callbackRouter } from "./router.ts";

// UpdateType supports all telegram update types https://core.telegram.org/bots/api#update
bot.on(UpdateType.Message, async ({ message }): Promise<void> => {
  const rr = await straightRouter.runRoute(message?.text!, message);
  if (!rr){
    await straightRouter.runRoute('default', message);
  }
  console.log(message);
});

bot.on(UpdateType.CallbackQuery, async ({ callback_query }) => {

  const rr = await callbackRouter.runRoute(callback_query?.data!, callback_query);
  if (!rr){
    await callbackRouter.runRoute('default', callback_query);
  }

  console.log(callback_query);
});

// if webhook was set up before, it should be deleted prior to switching to polling
await bot.deleteWebhook();

bot.on(
  UpdateType.Error,
  ({ error }) => console.error("Glitch in the Matrix", error.stack),
);

bot.run({
  polling: {
    timeout: 60,
  },
});
