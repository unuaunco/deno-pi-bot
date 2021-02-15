// import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";
import { Database } from "./deps.ts";
import { Storage, User, Transaction } from "./models/import.ts";
import "https://deno.land/x/dotenv/load.ts";

const db = new Database('mongo', {
    uri: Deno.env.get("MONGO_URI") || "",
    database: Deno.env.get("MONGO_DB_NAME") || "",
});

export default db;