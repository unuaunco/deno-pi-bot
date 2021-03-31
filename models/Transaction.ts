import { DataTypes, Model, Relationships } from "../deps.ts";
import { User } from "./import.ts";

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
    userId: Relationships.belongsTo(User),
  };

  static defaults = {
    currency: "rub",
    descrtiption: "",
    type: "outgoing",
  };

  static user() {
    return this.hasOne(User);
  }
}
