import { Model, DataTypes, Relationships } from "../deps.ts";

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
    }

    // Fetch transactions binded to this user
    static transactions() {
        return this.hasMany(Transaction);
    }

    //Fetch dialogs binder to this user
    static dialogs() {
        return this.hasMany(DialogFlow);
    }
}

export class Transaction extends Model {
    static table = 'transactions';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        descrtiption: DataTypes.string(128),
        type: DataTypes.enum(["incoming", "outgoing" ]),
        amount: DataTypes.decimal(2, 1),
        userId: Relationships.belongsTo(User),
    };

    static defaults = {
        currency: "rub",
      };

    static user() {
        return this.hasOne(User);
    }
}

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

export class DialogFlow extends Model {
    static table = 'dialogs';
    static timestamps = true;

    static fields = {
        _id: {
            primaryKey: true,
        },
        name: DataTypes.string(32),
        lastAction: DataTypes.string(32),
        isLastActionSuccess: DataTypes.BOOLEAN,
        userId: Relationships.belongsTo(User),
    };

    static defaults = {
        lastAction: "",
        isLastActionSuccess: true,
    };

    static user() {
        return this.hasOne(User);
    }
}