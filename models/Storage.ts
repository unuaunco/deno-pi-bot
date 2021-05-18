import { Model, DataTypes, Relationships } from "../deps.ts";
import { User, Currency } from "./import.ts";

export class Storage extends Model {
    static table = 'storages';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        name: DataTypes.string(32),
        balance: DataTypes.BIG_INTEGER,
        currency: Relationships.belongsTo(Currency),
        userId: Relationships.belongsTo(User),
    };

    static defaults = {
        currency: "1",
    };

    static user() {
        return this.hasOne(User);
    }

    static currency() {
        return this.hasOne(Currency);
    }
}