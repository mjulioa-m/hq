import { readFileSync } from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  databaseUrl?: string;
};

function readDatabaseUrlFromFile(): string | null {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        if (trimmed.slice(0, eq).trim() !== "DATABASE_URL") continue;
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (value) return value;
      }
    } catch {
      // next file
    }
  }
  return null;
}

function resolveDatabaseUrl(): string {
  if (globalForDb.databaseUrl) return globalForDb.databaseUrl;
  const fromFile = readDatabaseUrlFromFile();
  const url = fromFile || process.env.DATABASE_URL?.trim() || "";
  if (!url) {
    throw new Error(
      "DATABASE_URL no esta definida. Copia .env.local.example a .env.local o usa npm run db:embedded."
    );
  }
  globalForDb.databaseUrl = url;
  return url;
}

function getClient() {
  if (!globalForDb.pgClient) {
    globalForDb.pgClient = postgres(resolveDatabaseUrl(), {
      max: 10,
      prepare: false,
    });
  }
  return globalForDb.pgClient;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export type Db = ReturnType<typeof getDb>;
