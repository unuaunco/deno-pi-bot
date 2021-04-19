// import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";
import { Database, MongoDBConnector } from "./deps.ts";
import "https://deno.land/x/dotenv/load.ts";

const connector = new MongoDBConnector({
    uri:  Deno.env.get("MONGO_URI") || "",
    database: Deno.env.get("MONGO_DB_NAME") || ""
  });
  
const db = new Database(connector);

export default db;