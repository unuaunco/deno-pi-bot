import {
  Currency,
  DialogFlow,
  Storage,
  Transaction,
  User,
} from "./models/import.ts";
import {
  CallbackQuery,
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  Message,
  ReplyKeyboardMarkup,
  TelegramBot,
  UpdateType,
} from "./deps.ts";

function checkUser(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  let originalMethod = descriptor.value;
  //wrapping the original method
  descriptor.value = function (...args: any[]) {
    console.log("wrapped function: before invoking " + propertyKey);
    let result = originalMethod.apply(this, args);
    console.log("wrapped function: after invoking " + propertyKey);
    return result;
  };
}

import db from "./database.ts";

db.link([User, Storage, Transaction, Currency, DialogFlow]);

export interface Drop {
  drop: boolean;
}

const dropDb: Drop = { drop: false };

db.sync(dropDb);

if (dropDb.drop == true) {
  await Currency.create({
    name: "rub",
    precision: 2,
  });
  await Currency.create({
    name: "usd",
    precision: 2,
  });
  await Currency.create({
    name: "aud",
    precision: 2,
  });
}

export class BotViews {
  //TODO: объявить интерфейсы для диалогов и действий

  public dialogs = {
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
    start: {
      name: "start",
      label: "/start",
      actions: {
        startBot: "startBot",
      },
    },
    stop: {
      name: "stop",
      label: "/stop",
      actions: {
        startBot: "stop",
      },
    },
  };

  protected inlineKeyboard: ReplyKeyboardMarkup = {
    keyboard: [
      [{ text: this.dialogs.cacheIn.label }],
      [{ text: this.dialogs.cacheOut.label }],
      [{ text: this.dialogs.getBalance.label }],
      [{ text: this.dialogs.createStorage.label }],
    ],
  };

  bot: TelegramBot;

  constructor(tgBot: TelegramBot) {
    this.bot = tgBot;
  }

  async register(message: Message): Promise<void> {
    const chatId = message.chat.id;
    const user = await User.where("telegramId", message?.from?.id!).first();
    console.log(message);
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
        balance: 0,
        userId: JSON.stringify(newUser._id),
      });
      await this.bot.sendMessage({
        chat_id: chatId,
        text: `Welcome ${newUser.username}`,
        reply_markup: this.inlineKeyboard,
      });
    } else {
      await this.bot.sendMessage({
        chat_id: chatId,
        text: `Hello ${message.chat.username}`,
        reply_markup: this.inlineKeyboard,
      });
    }
  }

  async removeUser(message: Message): Promise<void> {
    // TODO: Delete User Storages and transactions on delete
    const user = await User.where("telegramId", message?.from?.id!).first();
    const chatId = message.chat.id;
    if (user) {
      await User.where("_id", JSON.stringify(user._id)).delete();
      await this.bot.sendMessage({
        chat_id: chatId,
        text: `See you later, ${message.chat.username}!`,
      });
    }
  }

  async insertInSum(message: Message): Promise<void> {
    const user = await User.where("telegramId", message.from?.id!).first();
    const chatId = message.chat.id;

    if (user) {
      await DialogFlow.create({
        name: this.dialogs.cacheIn.name,
        userId: JSON.stringify(user._id),
        lastAction: this.dialogs.cacheIn.actions.inputAmount,
      });
      await this.bot.sendMessage({
        chat_id: chatId,
        text: "Введите сумму:",
      });
    }
  }

  async insertOutSum(message: Message): Promise<void> {
    const user = await User.where("telegramId", message?.from?.id!).first();
    const chatId = message.chat.id;
    if (user) {
      await DialogFlow.create({
        name: this.dialogs.cacheOut.name,
        userId: JSON.stringify(user._id),
        lastAction: this.dialogs.cacheOut.actions.inputAmount,
      });
      await this.bot.sendMessage({
        chat_id: chatId,
        text: "Введите сумму:",
      });
    }
  }

  async getBalance(message: Message): Promise<void> {
    const user = await User.where("telegramId", message?.from?.id!).first();
    const chatId = message.chat.id;
    if (user) {
      await DialogFlow.create({
        name: this.dialogs.getBalance.name,
        userId: JSON.stringify(user._id),
        lastAction: this.dialogs.getBalance.actions.storageSelect,
      });
      const userStorages: any = [];
      userStorages.push([{
        text: "Сводный",
        callback_data: "Сводный",
      }]);
      const storages = await Storage.where("userId", JSON.stringify(user._id))
        .all();
      for (const idx in storages) {
        userStorages.push([{
          text: storages[idx].name,
          callback_data: storages[idx].name,
        }]);
      }
      await this.bot.sendMessage({
        chat_id: chatId,
        text: "Выберите счёт",
        reply_markup: {
          inline_keyboard: userStorages,
        },
      });
    }
  }

  async storageCreate(message: Message): Promise<void> {
    const user = await User.where("telegramId", message?.from?.id!).first();
    const chatId = message.chat.id;
    if (user) {
      await DialogFlow.create({
        name: this.dialogs.createStorage.name,
        userId: JSON.stringify(user._id),
        lastAction: this.dialogs.createStorage.actions.newStorage,
      });
      await this.bot.sendMessage({
        chat_id: chatId,
        text: "Введите название счёта:",
      });
    }
  }

  async returnActions(message: Message): Promise<void> {
    // TODO: refactor this - make dialog and action related routes
    const user = await User.where("telegramId", message?.from?.id!).first();
    const chatId = message.chat.id;
    if (user) {
      const lastDialog = await DialogFlow
        .where("userId", JSON.stringify(user._id))
        .orderBy("_id", "desc")
        .first();
      if (lastDialog) {
        if (lastDialog.name === this.dialogs.cacheIn.name) {
          if (
            lastDialog.lastAction === this.dialogs.cacheIn.actions.inputAmount
          ) {
            const reg = new RegExp("[0-9]+(?:\.|,)[0-9]+");
            const reg2 = new RegExp("[0-9]+");
            if (reg.test(message?.text!) || reg2.test(message?.text!)) {
              let amount: number;
              if(reg.test(message?.text!)){
                amount = Number(
                  message?.text!.replace(",", "").replace(".", ""),
                )
              }
              else{
                amount = Number(
                  `${message?.text!}00`
                )
              }
              await Transaction.create({
                type: "incoming",
                amount: amount,
                userId: JSON.stringify(user._id),
              });

              const userStorages: any = [];
              const storages = await Storage.where(
                "userId",
                JSON.stringify(user._id),
              ).all();

              for (const idx in storages) {
                userStorages.push({
                  text: storages[idx].name,
                  callback_data: storages[idx].name,
                });
              }

              await this.bot.sendMessage({
                chat_id: chatId,
                text: "Выберите счёт",
                reply_markup: {
                  inline_keyboard: [
                    userStorages,
                  ],
                },
              });

              lastDialog.lastAction =
                this.dialogs.cacheIn.actions.storageSelect;
              await lastDialog.update();
            } else {
              await this.bot.sendMessage({
                chat_id: chatId,
                text:
                  "Не могу распознать введённую сумму. Ведите значение в виде 000.00 или 000",
              });
            }
          }
        } else if (lastDialog.name === this.dialogs.cacheOut.name) {
          if (
            lastDialog.lastAction === this.dialogs.cacheOut.actions.inputAmount
          ) {
            const reg = new RegExp("[0-9]+(?:\.|,)[0-9]+");
            const reg2 = new RegExp("[0-9]+");
            if (reg.test(message?.text!) || reg2.test(message?.text!)) {
              let amount: number;
              if(reg.test(message?.text!)){
                amount = Number(
                  message?.text!.replace(",", "").replace(".", ""),
                )
              }
              else{
                amount = Number(
                  `${message?.text!}00`
                )
              }
              await Transaction.create({
                type: "outgoing",
                amount: amount,
                userId: JSON.stringify(user._id),
              });

              const userStorages: any = [];
              const storages = await Storage
                .where("userId", JSON.stringify(user._id))
                .all();
              for (const idx in storages) {
                userStorages.push({
                  text: storages[idx].name,
                  callback_data: storages[idx].name,
                });
              }

              await this.bot.sendMessage({
                chat_id: chatId,
                text: "Выберите счёт",
                reply_markup: {
                  inline_keyboard: [
                    userStorages,
                  ],
                },
              });

              lastDialog.lastAction =
                this.dialogs.cacheIn.actions.storageSelect;
              await lastDialog.update();
            } else {
              await this.bot.sendMessage({
                chat_id: chatId,
                text:
                  "Не могу распознать введённую сумму. Ведите значение в виде 000.00 или 000",
              });
            }
          }
        } else if (lastDialog.name === this.dialogs.createStorage.name) {
          await Storage.create({
            name: message?.text!,
            balance: 0,
            userId: JSON.stringify(user._id),
          });

          lastDialog.lastAction = "finished";
          lastDialog.update();

          await this.bot.sendMessage({
            chat_id: chatId,
            text: "Счёт добавлен",
          });
        }
      } else {
        await this.bot.sendMessage({
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

  async callbackActions(callbackQuery: CallbackQuery): Promise<void> {
    const { id, data, from } = callbackQuery;
    const user = await User.where("telegramId", from?.id!).first();
    if (user) {
      let text = data === "red" ? "🐰" : "Good morning, Mr. Anderson.";
      const lastDialog = await DialogFlow
        .where("userId", JSON.stringify(user._id))
        .orderBy("_id", "desc")
        .first();
      if (lastDialog) {
        if (lastDialog.name === this.dialogs.cacheIn.name) {
          if (
            lastDialog.lastAction === this.dialogs.cacheIn.actions.storageSelect
          ) {
            const lastTransaction = await Transaction
              .where("userId", JSON.stringify(user._id))
              .orderBy("_id", "desc")
              .first();

            const usrStorage = await Storage
              .where("userId", JSON.stringify(user._id))
              .where("name", data!)
              .first();
            usrStorage.balance = Number(Number(usrStorage.balance)) +
              Number(Number(lastTransaction.amount));
            await usrStorage.update();

            lastDialog.lastAction = "finished";
            await lastDialog.update();

            text = "Поступление добавлено";
          }
        } else if (lastDialog.name === this.dialogs.cacheOut.name) {
          if (
            lastDialog.lastAction ===
              this.dialogs.cacheOut.actions.storageSelect
          ) {
            const lastTransaction = await Transaction
              .where("userId", JSON.stringify(user._id))
              .orderBy("_id", "desc")
              .first();

            const usrStorage = await Storage
              .where("userId", JSON.stringify(user._id))
              .where("name", data!)
              .first();
            usrStorage.balance = Number(Number(usrStorage.balance)) -
              Number(Number(lastTransaction.amount));
            await usrStorage.update();

            lastDialog.lastAction = "finished";
            await lastDialog.update();

            text = "Расход добавлен";
          }
        } else if (lastDialog.name === this.dialogs.getBalance.name) {
          if (
            lastDialog.lastAction ===
              this.dialogs.getBalance.actions.storageSelect
          ) {
            if (data === "Сводный") {
              const storageBalance = await Storage
                .where("userId", JSON.stringify(user._id))
                .all();
              let resultBalance = new String();

              for (const idx in storageBalance) {
                resultBalance = String(
                  Number(resultBalance) +
                    Number(storageBalance[idx].balance),
                );
              }
              console.log(Number(resultBalance));
              text = `Суммарный баланс счетов: ${
                resultBalance.slice(0, resultBalance.length - 2)
              }.${
                resultBalance.slice(
                  resultBalance.length - 2,
                  resultBalance.length,
                )
              }`;
            } else {
              const usrStorage = await Storage
                .where("userId", JSON.stringify(user._id))
                .where("name", data!)
                .first();
              const balance = String(usrStorage.balance);
							text = `Баланс счёта "${usrStorage.name}": ${
                balance.slice(0, balance.length - 2)
							}.${
								balance.slice(
									balance.length - 2,
									balance.length,
								)
							}`;
            }
            //write sequentially
            //   lastDialog.lastAction = "finished";
            //   await lastDialog.update();
          }
        }
      }
      await this.bot.sendMessage({
        chat_id: from.id,
        text,
      });

      await this.bot.answerCallbackQuery({
        callback_query_id: id,
      });
    }
  }
}
