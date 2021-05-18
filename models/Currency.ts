import { Model, DataTypes } from "../deps.ts";
import { Transaction, Storage } from "./import.ts";

export class Currency extends Model {
    static table = 'currencies';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        name: DataTypes.string(3),
        precision: DataTypes.INTEGER
    };

    static defaults = {
        precision: 2,
    };

    // Fetch transactions binded to this currency
    static transactions() {
        return this.hasMany(Transaction);
    }

    //Fetch storages binder to this currency
    static storages() {
        return this.hasMany(Storage);
    }
}