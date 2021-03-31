/**
 * Try the example right from the terminal
 * MacOS, Linux $:
 * TOKEN=512215541:AAGqR0z0facbFkrgqIacxnw_F49ju_Z0MNY deno run --allow-net --allow-env https://deno.land/x/telegram_bot_api/examples/01-polling.ts
 * Windows $:
 * $env:TOKEN="512215541:AAGqR0z0facbFkrgqIacxnw_F49ju_Z0MNY"; deno run --allow-net --allow-env --allow-read telega.ts
 */

import db from "./database.ts";
import { TelegramBot, UpdateType } from "./deps.ts";

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

db.link([User, Storage, Transaction, DialogFlow]);

await db.sync({ drop: false });

const TOKEN = Deno.env.get("TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const dialogs = {
  cacheIn: {
    name: "cacheIn",
    label: "💵 Внести поступление",
    actions: {
      storageSelect: "storageSelect",
      inputAmount: "inputAmount",
    },
  },
  cacheOut: {
    name: "cacheOut",
    label: "💴 Внести расход",
    actions: {
      storageSelect: "storageSelect",
      inputAmount: "inputAmount",
    },
  },
  getBalance: {
    name: "getBalance",
    label: "💹 Узнать состояние счёта",
    actions: {
      storageSelect: "storageSelect",
    },
  },
  createStorage: {
    name: "createStorage",
    label: "🧾 Создать счёт",
    actions: {
      newStorage: "newStorage",
    },
  },
};

const inlineKeyboard: any = {
  keyboard: [
    [{ text: dialogs.cacheIn.label }],
    [{ text: dialogs.cacheOut.label }],
    [{ text: dialogs.getBalance.label }],
    [{ text: dialogs.createStorage.label }],
  ],
};

// UpdateType supports all telegram update types https://core.telegram.org/bots/api#update
bot.on(UpdateType.Message, async ({ message }): Promise<void> => {
  // const hash = createHash("sha256");

  const chatId = message.chat.id;
  const user = await User.where("telegramId", message?.from?.id!).first();

  if (message.text === "/start") {
    if (!user) {
      const newUser = await User.create({
        firstName: message?.from?.first_name!,
        lastName: message?.from?.last_name!,
        username: message?.from?.username!,
        email: "",
        passwordHash: "132123123",
        telegramId: message?.from?.id!,
      });
      await Storage.create({
        name: "По-умолчанию",
        balance: 0.00,
        userId: JSON.stringify(newUser._id),
      });
      await bot.sendMessage({
        chat_id: chatId,
        text: `Welcome ${newUser.username}`,
        reply_markup: inlineKeyboard,
      });
    } else {
      await bot.sendMessage({
        chat_id: chatId,
        text: `Hello ${message.chat.username}`,
        reply_markup: inlineKeyboard,
      });
    }
  } else if (message.text === "/stop") {
    if (user) {
      await User.where("_id", JSON.stringify(user._id)).delete();
      await bot.sendMessage({
        chat_id: chatId,
        text: `See you later, ${message.chat.username}!`,
      });
    }
  } else if (message.text === dialogs.cacheIn.label) { // Внесение
    if (user) {
      await DialogFlow.create({
        name: dialogs.cacheIn.name,
        userId: JSON.stringify(user._id),
        lastAction: dialogs.cacheIn.actions.inputAmount,
      });
      await bot.sendMessage({
        chat_id: chatId,
        text: "Введите сумму:",
      });
    }
  } else if (message.text === dialogs.cacheOut.label) { // Расход
    if (user) {
      await DialogFlow.create({
        name: dialogs.cacheOut.name,
        userId: JSON.stringify(user._id),
        lastAction: dialogs.cacheOut.actions.inputAmount,
      });
      await bot.sendMessage({
        chat_id: chatId,
        text: "Введите сумму:",
      });
    }
  } else if (message.text === dialogs.getBalance.label) { //Баланс
    if (user) {
      await DialogFlow.create({
        name: dialogs.getBalance.name,
        userId: JSON.stringify(user._id),
        lastAction: dialogs.getBalance.actions.storageSelect,
      });
      const userStorages: any = [];
      userStorages.push([{
        text: "Сводный",
        callback_data: "Сводный",
      }]);
      const storages = await Storage.where("userId", JSON.stringify(user._id))
        .all();
      for (var idx in storages) {
        userStorages.push([{
          text: storages[idx].name,
          callback_data: storages[idx].name,
        }]);
      }
      await bot.sendMessage({
        chat_id: chatId,
        text: "Выберите счёт",
        reply_markup: {
          inline_keyboard: userStorages,
        },
      });
    }
  } else if (message.text === dialogs.createStorage.label) { //Cчёт
    if (user) {
      await DialogFlow.create({
        name: dialogs.createStorage.name,
        userId: JSON.stringify(user._id),
        lastAction: dialogs.createStorage.actions.newStorage,
      });
      await bot.sendMessage({
        chat_id: chatId,
        text: "Введите название счёта:",
      });
    }
  } else {
    if (user) {
      const lastDialog = await DialogFlow
        .where("userId", JSON.stringify(user._id))
        .orderBy("_id", "desc")
        .first();
      if (lastDialog) {
        if (lastDialog.name === dialogs.cacheIn.name) {
          if (lastDialog.lastAction === dialogs.cacheIn.actions.inputAmount) {
            await Transaction.create({
              type: "incoming",
              amount: Number(message?.text!),
              userId: JSON.stringify(user._id),
            });

            const userStorages: any = [];
            const storages = await Storage.where(
              "userId",
              JSON.stringify(user._id),
            )
              .all();
            for (var idx in storages) {
              userStorages.push({
                text: storages[idx].name,
                callback_data: storages[idx].name,
              });
            }

            await bot.sendMessage({
              chat_id: chatId,
              text: "Выберите счёт",
              reply_markup: {
                inline_keyboard: [
                  userStorages,
                ],
              },
            });

            lastDialog.lastAction = dialogs.cacheIn.actions.storageSelect;
            await lastDialog.update();
          }
        } else if (lastDialog.name === dialogs.cacheOut.name) {
          if (lastDialog.lastAction === dialogs.cacheOut.actions.inputAmount) {
            await Transaction.create({
              type: "outgoing",
              amount: Number(message?.text!),
              userId: JSON.stringify(user._id),
            });

            const userStorages: any = [];
            const storages = await Storage
              .where("userId", JSON.stringify(user._id))
              .all();
            for (var idx in storages) {
              userStorages.push({
                text: storages[idx].name,
                callback_data: storages[idx].name,
              });
            }

            await bot.sendMessage({
              chat_id: chatId,
              text: "Выберите счёт",
              reply_markup: {
                inline_keyboard: [
                  userStorages,
                ],
              },
            });

            lastDialog.lastAction = dialogs.cacheIn.actions.storageSelect;
            await lastDialog.update();
          }
        } else if (lastDialog.name === dialogs.createStorage.name) {
          await Storage.create({
            name: message?.text!,
            balance: 0.00,
            userId: JSON.stringify(user._id),
          });

          lastDialog.lastAction = "finished";
          lastDialog.update();

          await bot.sendMessage({
            chat_id: chatId,
            text: "Счёт добавлен",
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
    }
  }

  console.log(message);
});

bot.on(UpdateType.CallbackQuery, async ({ callback_query }) => {
  const { id, data, from } = callback_query;
  const user = await User.where("telegramId", from?.id!).first();
  if (user) {
    let text = data === "red" ? "🐰" : "Good morning, Mr. Anderson.";
    const lastDialog = await DialogFlow
      .where("userId", JSON.stringify(user._id))
      .orderBy("_id", "desc")
      .first();
    if (lastDialog) {
      if (lastDialog.name === dialogs.cacheIn.name) {
        if (lastDialog.lastAction === dialogs.cacheIn.actions.storageSelect) {
          const lastTransaction = await Transaction
            .where("userId", JSON.stringify(user._id))
            .orderBy("_id", "desc")
            .first();

          const usrStorage = await Storage
            .where("userId", JSON.stringify(user._id))
            .where("name", data!)
            .first();
          usrStorage.balance =
            Number(Number(usrStorage.balance).toPrecision(4)) +
            Number(Number(lastTransaction.amount).toPrecision(4));
          await usrStorage.update();

          lastDialog.lastAction = "finished";
          await lastDialog.update();

          text = "Поступление добавлено";
        }
      } else if (lastDialog.name === dialogs.cacheOut.name) {
        if (lastDialog.lastAction === dialogs.cacheOut.actions.storageSelect) {
          const lastTransaction = await Transaction
            .where("userId", JSON.stringify(user._id))
            .orderBy("_id", "desc")
            .first();

          const usrStorage = await Storage
            .where("userId", JSON.stringify(user._id))
            .where("name", data!)
            .first();
          usrStorage.balance =
            Number(Number(usrStorage.balance).toPrecision(4)) -
            Number(Number(lastTransaction.amount).toPrecision(4));
          await usrStorage.update();

          lastDialog.lastAction = "finished";
          await lastDialog.update();

          text = "Расход добавлен";
        }
      } else if (lastDialog.name === dialogs.getBalance.name) {
        if (
          lastDialog.lastAction === dialogs.getBalance.actions.storageSelect
        ) {
          if (data === "Сводный") {
            const storageBalance = await Storage
              .where("userId", JSON.stringify(user._id))
              .all();
            let resultBalance = new Number(0.0);

            for (const idx in storageBalance) {
              resultBalance = Number(resultBalance) +
                Number(storageBalance[idx].balance);
            }
            console.log(Number(resultBalance).toPrecision(2));
            text = `Суммарный баланс счетов: ${resultBalance.toPrecision(5)}`;
          } else {
            const usrStorage = await Storage
              .where("userId", JSON.stringify(user._id))
              .where("name", data!)
              .first();
            text = `Баланс счёта "${usrStorage.name}": ${
              Number(usrStorage.balance).toPrecision(5)
            }`;
          }
          //write sequentially
        //   lastDialog.lastAction = "finished";
        //   await lastDialog.update();
        }
      }
    }
    await bot.sendMessage({
      chat_id: from.id,
      text,
    });

    await bot.answerCallbackQuery({
      callback_query_id: id,
    });
  }
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
