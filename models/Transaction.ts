import { DataTypes, Model, Relationships } from "../deps.ts";
import { Storage, Currency } from "./import.ts";

export class Transaction extends Model {
  static table = "transactions";
  static timestamps = true;

  static fields = {
    _id: {
      primaryKey: true,
    },
    descrtiption: DataTypes.string(128),
    type: DataTypes.enum(["incoming", "outgoing"]),
    amount: DataTypes.BIG_INTEGER,
    storageId: Relationships.belongsTo(Storage),
    currency: Relationships.belongsTo(Currency)
  };

  static defaults = {
    currency: "1",
    descrtiption: "",
    type: "outgoing",
  };

  static storage() {
    return this.hasOne(Storage);
  }
  
  static currency() {
    return this.hasOne(Currency);
  }

}
