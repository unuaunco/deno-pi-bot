import { Model, DataTypes, Relationships } from "../deps.ts";
import { User } from "./import.ts";

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