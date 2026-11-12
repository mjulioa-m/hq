/**
 * Postgres embebido para desarrollo local (sin Docker).
 * Deja el proceso vivo hasta Ctrl+C.
 */
import EmbeddedPostgres from "embedded-postgres";
import path from "path";

const port = Number(process.env.PG_PORT || 54330);
const databaseDir = path.join(process.cwd(), "data", "embedded-pg");

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "hq",
  password: "hq",
  port,
  persistent: true,
  onLog: (msg) => {
    if (typeof msg === "string" && msg.trim()) console.log("[pg]", msg.trim());
  },
  onError: (err) => console.error("[pg:err]", err),
});

async function main() {
  console.log(`Inicializando Postgres embebido en ${databaseDir} ...`);
  try {
    await pg.initialise();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/not empty|already exists|already initialized/i.test(msg)) throw e;
    console.log("El clúster ya existe, se reutiliza.");
  }
  console.log(`Arrancando en el puerto ${port} ...`);
  await pg.start();

  try {
    await pg.createDatabase("hq");
    console.log("Base hq lista.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/already exists/i.test(msg)) console.warn("createDatabase:", msg);
    else console.log("La base hq ya existe.");
  }

  const url = `postgresql://hq:hq@127.0.0.1:${port}/hq`;
  console.log("");
  console.log("DATABASE_URL=" + url);
  console.log("Postgres embebido en marcha. Deja esta terminal abierta.");
  console.log("Ctrl+C para parar.");
}

async function shutdown() {
  try {
    await pg.stop();
  } catch {
    // ignore
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
