import dns from "dns";
import { Collection, Db, MongoClient } from "mongodb";
import type { App } from "./types";

// Configure reliable DNS servers for SRV lookups (resolves querySrv ECONNREFUSED on Windows/ISPs)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in restricted environments
}

export type ApplicationDocument = Omit<App, "id" | "salary" | "workMode"> & {
  _id: string;
  salary?: string;
  workMode?: string;
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "job-tracker";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDb(): Promise<Db> {
  const connectionUri = process.env.MONGODB_URI || uri;
  if (!connectionUri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please add your MongoDB Atlas connection string to .env.local"
    );
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(connectionUri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(connectionUri);
      clientPromise = client.connect();
    }
  }

  const resolvedClient = await clientPromise;
  return resolvedClient.db(dbName);
}

export async function getApplicationsCollection(): Promise<Collection<ApplicationDocument>> {
  const db = await getDb();
  return db.collection<ApplicationDocument>("applications");
}
