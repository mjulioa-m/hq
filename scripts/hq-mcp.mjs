import http from "node:http";
import https from "node:https";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const base = (process.env.HQ_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function tokenFromFile() {
  try {
    return readFileSync(join(root, ".cursor", "hq.token"), "utf8").trim();
  } catch {
    return "";
  }
}

const token = process.env.HQ_API_TOKEN?.trim() || tokenFromFile();

const taskFields = {
  title: z.string().describe("Título corto, máximo 240 caracteres."),
  notes: z.string().optional().describe("Detalle, correo o marcas como (OK) y (Entregar)."),
  project: z.string().optional().describe("Slug del proyecto. Si no viene, se usa el primero de la lista."),
  dueDate: z.string().optional().describe("Fecha YYYY-MM-DD, solo si el texto la trae."),
  priority: z.enum(["baja", "normal", "alta"]).optional(),
};

function api(path, { method = "GET", body } = {}) {
  if (!token) return Promise.reject(new Error("Falta la clave. Ponla en .cursor/hq.token (una sola línea) o en HQ_API_TOKEN."));
  const payload = body ? JSON.stringify(body) : null;
  const url = new URL(`${base}${path}`);
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(payload
            ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) }
            : {}),
        },
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          let data = {};
          if (raw) {
            try {
              data = JSON.parse(raw);
            } catch {
              data = {};
            }
          }
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(data.error || `HQ respondió ${response.statusCode}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function projects() {
  const data = await api("/api/projects");
  return data.items ?? [];
}

async function projectId(slug) {
  const list = await projects();
  const name = (slug || "").trim();
  if (!name) {
    if (!list[0]) throw new Error("No hay proyectos.");
    return list[0].id;
  }
  const found = list.find((item) => item.slug === name);
  if (!found) throw new Error(`No existe el proyecto ${name}.`);
  return found.id;
}

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(error) {
  return {
    isError: true,
    content: [{ type: "text", text: error instanceof Error ? error.message : "No se pudo hablar con HQ." }],
  };
}

const server = new McpServer({ name: "hq", version: "1.0.0" });

server.registerTool(
  "list_projects",
  { description: "Lista los proyectos de HQ con su slug." },
  async () => {
    try {
      return ok(await projects());
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "list_tasks",
  {
    description: "Lista tareas de HQ. Sin includeDone solo trae las pendientes.",
    inputSchema: {
      project: z.string().optional().describe("Slug del proyecto. Vacío trae todas."),
      includeDone: z.boolean().optional().describe("Si es true, incluye las ya hechas."),
    },
  },
  async ({ project, includeDone }) => {
    try {
      const query = new URLSearchParams();
      if (project) query.set("projectId", await projectId(project));
      query.set("includeDone", includeDone ? "1" : "0");
      const data = await api(`/api/tasks?${query}`);
      const items = (data.items ?? []).map((task) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        done: task.done,
        dueDate: task.dueDate,
        priority: task.priority,
        projectId: task.projectId,
      }));
      return ok(items);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "create_tasks",
  {
    description:
      "Crea una o varias tareas. Si no viene project, usa el primer proyecto de la lista. El título va corto. El detalle y las marcas (OK) o (Entregar) van en notes. No des la tarea por hecha solo porque el texto diga OK o Entregar.",
    inputSchema: {
      tasks: z.array(z.object(taskFields)).min(1),
    },
  },
  async ({ tasks }) => {
    try {
      const created = [];
      const errors = [];
      for (const task of tasks) {
        try {
          const item = await api("/api/tasks", {
            method: "POST",
            body: {
              title: task.title,
              notes: task.notes ?? "",
              projectId: await projectId(task.project),
              dueDate: task.dueDate ?? null,
              priority: task.priority ?? "normal",
            },
          });
          created.push({ id: item.item?.id, title: item.item?.title });
        } catch (error) {
          errors.push({ title: task.title, error: error instanceof Error ? error.message : "No se pudo crear." });
        }
      }
      return ok({ created, errors });
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "complete_task",
  {
    description: "Marca una tarea de HQ como hecha.",
    inputSchema: { id: z.string().describe("Id de la tarea.") },
  },
  async ({ id }) => {
    try {
      const data = await api(`/api/tasks/${id}`, { method: "PATCH", body: { done: true } });
      return ok({ id: data.item?.id, title: data.item?.title, done: data.item?.done });
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "list_reminders",
  { description: "Lista los recordatorios de HQ y cuándo vuelve a tocar cada uno." },
  async () => {
    try {
      const data = await api("/api/reminders");
      const items = (data.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        everyAmount: item.everyAmount,
        everyUnit: item.everyUnit,
        nextAt: item.nextAt,
      }));
      return ok(items);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "create_reminder",
  {
    description: "Crea un recordatorio. everyUnit es hour, day, week o month. everyAmount es cuántas unidades.",
    inputSchema: {
      name: z.string(),
      everyAmount: z.number().int().min(1).max(365),
      everyUnit: z.enum(["hour", "day", "week", "month"]),
    },
  },
  async ({ name, everyAmount, everyUnit }) => {
    try {
      const data = await api("/api/reminders", {
        method: "POST",
        body: { name, everyAmount, everyUnit },
      });
      return ok(data.item);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "complete_reminder",
  {
    description: "Marca un recordatorio como listo y corre la próxima fecha según su intervalo.",
    inputSchema: { id: z.string().describe("Id del recordatorio.") },
  },
  async ({ id }) => {
    try {
      const data = await api(`/api/reminders/${id}`, { method: "PATCH", body: { done: true } });
      return ok({ id: data.item?.id, name: data.item?.name, nextAt: data.item?.nextAt });
    } catch (error) {
      return fail(error);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
