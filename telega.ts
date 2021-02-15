/**
 * Try the example right from the terminal
 * MacOS, Linux $:
 * TOKEN=512215541:AAGqR0z0facbFkrgqIacxnw_F49ju_Z0MNY deno run --allow-net --allow-env https://deno.land/x/telegram_bot_api/examples/01-polling.ts
 * Windows $:
 * $env:TOKEN="512215541:AAGqR0z0facbFkrgqIacxnw_F49ju_Z0MNY"; deno run --allow-net --allow-env --allow-read telega.ts
 */

import db from "./database.ts";
import { TelegramBot, UpdateType } from "./deps.ts";

import { Storage, Transaction, User } from "./models/import.ts";

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

db.link([User, Storage, Transaction]);

await db.sync({ drop: true });

const TOKEN = Deno.env.get("TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

// UpdateType supports all telegram update types https://core.telegram.org/bots/api#update
bot.on(UpdateType.Message, async ({ message }): Promise<void> => {
  // const hash = createHash("sha256");

  const chatId = message.chat.id;

  if (message.text === "/start") {
    const user = await User.where("telegramId", message?.from?.id).get();
    if (!user.length) {
      const newUser = await User.create({
        firstName: message?.from?.first_name!,
        lastName: message?.from?.last_name!,
        username: message?.from?.username!,
        email: "",
        passwordHash: "132123123",
        telegramId: message?.from?.id!,
      });
      await bot.sendMessage({
        chat_id: chatId,
        text: `Welcome ${newUser.username}`,
      });
    } else {
      await bot.sendMessage({
        chat_id: chatId,
        text: `Hello ${message.chat.username}`,
      });
    }
  } else if (message.text === "/stop") {
    const user = await User.where("telegramId", message?.from?.id).get();
    if (user) {
      await User.where("telegramId", message?.from?.id).delete();
      await bot.sendMessage({
        chat_id: chatId,
        text: `See you later, ${message.chat.username}!`,
      });
    }
  } else {
    await bot.sendMessage({
      chat_id: chatId,
      text: "Chose a pill",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔴", callback_data: "red" },
            { text: "🔵", callback_data: "blue" },
          ],
        ],
      },
    });
  }

  console.log(message);
});

bot.on(UpdateType.CallbackQuery, async ({ callback_query }) => {
  const { id, data, from } = callback_query;
  const text = data === "red" ? "🐰" : "Good morning, Mr. Anderson.";

  await bot.sendMessage({
    chat_id: from.id,
    text,
  });

  await bot.answerCallbackQuery({
    callback_query_id: id,
  });
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
