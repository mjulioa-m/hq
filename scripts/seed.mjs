import { readFile } from "fs/promises";
import path from "path";
import { hash } from "bcryptjs";
import postgres from "postgres";

async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = await readFile(path.join(process.cwd(), file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // next file
    }
  }
}

const PROJECTS = [
  {
    slug: "trabajo",
    name: "Trabajo",
    description: "El trabajo del día.",
    color: "#7dd3fc",
    sceneSlug: "factin",
    sortOrder: 0,
  },
  {
    slug: "casa",
    name: "Casa",
    description: "Lo de la casa.",
    color: "#f9a8d4",
    sceneSlug: "marie",
    sortOrder: 1,
  },
  {
    slug: "estudio",
    name: "Estudio",
    description: "Ideas y piezas.",
    color: "#f5c16c",
    sceneSlug: "boston-990",
    sortOrder: 2,
  },
  {
    slug: "personal",
    name: "Personal",
    description: "Lo que no pertenece a un negocio.",
    color: "#c4b5fd",
    sceneSlug: "aprendido",
    sortOrder: 3,
  },
];

await loadEnv();
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
const name = (process.env.ADMIN_NAME || "Admin").trim();

if (email && password) {
  const existing = await sql`select id from users where email = ${email} limit 1`;
  if (existing.length === 0) {
    const passwordHash = await hash(password, 12);
    await sql`insert into users (id, name, email, password_hash) values (${crypto.randomUUID()}, ${name}, ${email}, ${passwordHash})`;
    console.log(`Usuario creado: ${email}`);
  } else {
    console.log(`Usuario ya existe: ${email}`);
  }
} else {
  console.log("ADMIN_EMAIL o ADMIN_PASSWORD vacíos: no se crea usuario.");
}

for (const project of PROJECTS) {
  const found = await sql`select id from projects where slug = ${project.slug} limit 1`;
  if (found.length === 0) {
    await sql`
      insert into projects (id, slug, name, description, color, scene_slug, sort_order)
      values (
        ${crypto.randomUUID()},
        ${project.slug},
        ${project.name},
        ${project.description},
        ${project.color},
        ${project.sceneSlug},
        ${project.sortOrder}
      )
    `;
    console.log(`Proyecto creado: ${project.name}`);
  }
}

await sql.end();
console.log("Seed listo.");
