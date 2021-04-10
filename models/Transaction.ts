import { DataTypes, Model, Relationships } from "../deps.ts";
import { Storage } from "./import.ts";

export class Transaction extends Model {
  static table = "transactions";
  static timestamps = true;

  static fields = {
    _id: {
      primaryKey: true,
    },
    descrtiption: DataTypes.string(128),
    type: DataTypes.enum(["incoming", "outgoing"]),
    amount: DataTypes.decimal(2, 1),
    storageId: Relationships.belongsTo(Storage)
  };

  static defaults = {
    currency: "rub",
    descrtiption: "",
    type: "outgoing",
  };

  static storage() {
    return this.hasOne(Storage);
  }
}
