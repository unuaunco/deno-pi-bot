import { Model, DataTypes, Relationships } from "../deps.ts";
import { User } from "./import.ts";

export class Storage extends Model {
    static table = 'storages';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        name: DataTypes.string(32),
        currency: DataTypes.enum(["rub", "usd", "aud" ]),
        balance: DataTypes.decimal(2, 1),
        userId: Relationships.belongsTo(User),
    };

    static defaults = {
        currency: "rub",
    };

    static user() {
        return this.hasOne(User);
    }
}