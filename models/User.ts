import { Model, DataTypes, Relationships } from "../deps.ts";
import { Storage, Transaction } from "./import.ts";

export class User extends Model {
    static table = 'users';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        firstName: DataTypes.string(32),
        lastName: DataTypes.string(32),
        username: DataTypes.string(16),
        email: DataTypes.string(32),
        passwordHash: DataTypes.string(256),
        telegramId: DataTypes.STRING,
    };

    // Fetch storages binded to this user
    static storages() {
        return this.hasMany(Storage);
    };

    // Fetch transactions binded to this user
    static transactions() {
        return this.hasMany(Transaction);
    };
}
