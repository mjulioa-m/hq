import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("#f0c7a6"),
  sceneSlug: text("scene_slug").notNull().default("proyectos"),
  sortOrder: integer("sort_order").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const tasks = pgTable(
  "tasks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    notes: text("notes").notNull().default(""),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    dueDate: date("due_date", { mode: "string" }),
    priority: text("priority").notNull().default("normal"),
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { mode: "date" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("tasks_done_due_idx").on(t.done, t.dueDate)]
);

export const dailyNotes = pgTable("daily_notes", {
  date: date("date", { mode: "string" }).primaryKey(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const contentPieces = pgTable("content_pieces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  platform: text("platform").notNull(),
  format: text("format").notNull().default("video"),
  title: text("title").notNull(),
  currentStage: text("current_stage").notNull().default("idea"),
  status: text("status").notNull().default("en_marcha"),
  plannedDate: date("planned_date", { mode: "string" }),
  publishedAt: timestamp("published_at", { mode: "date" }),
  publishedUrl: text("published_url"),
  metrics: jsonb("metrics")
    .$type<{
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
    }>()
    .notNull()
    .$defaultFn(() => ({})),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contentStageNotes = pgTable(
  "content_stage_notes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pieceId: text("piece_id")
      .notNull()
      .references(() => contentPieces.id, { onDelete: "cascade" }),
    stage: text("stage").notNull(),
    content: text("content").notNull().default(""),
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { mode: "date" }),
  },
  (t) => [uniqueIndex("content_stage_piece_idx").on(t.pieceId, t.stage)]
);

export const contentAssets = pgTable("content_assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  pieceId: text("piece_id")
    .notNull()
    .references(() => contentPieces.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  kind: text("kind").notNull(),
  label: text("label").notNull().default(""),
  url: text("url"),
  filePath: text("file_path"),
  isChosen: boolean("is_chosen").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contentReferences = pgTable("content_references", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  platform: text("platform").notNull(),
  url: text("url").notNull().default(""),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  views: integer("views"),
  publishedOn: date("published_on", { mode: "string" }),
  tag: text("tag").notNull().default("competencia"),
  useful: boolean("useful"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  source: text("source").notNull().default(""),
  stage: text("stage").notNull().default("lead"),
  value: numeric("value", { precision: 14, scale: 2 }),
  nextAction: text("next_action").notNull().default(""),
  nextActionDate: date("next_action_date", { mode: "string" }),
  notes: text("notes").notNull().default(""),
  wonAt: timestamp("won_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const contactActivities = pgTable("contact_activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("nota"),
  summary: text("summary").notNull(),
  happenedAt: timestamp("happened_at", { mode: "date" }).defaultNow().notNull(),
});

export const financeEntries = pgTable("finance_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("COP"),
  category: text("category").notNull().default("Otros"),
  description: text("description").notNull().default(""),
  entryDate: date("entry_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const decisions = pgTable("decisions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  context: text("context").notNull().default(""),
  options: jsonb("options").$type<string[]>().notNull().$defaultFn(() => []),
  status: text("status").notNull().default("pendiente"),
  outcome: text("outcome").notNull().default(""),
  dueDate: date("due_date", { mode: "string" }),
  decidedAt: timestamp("decided_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  prompt: text("prompt").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const learnings = pgTable("learnings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  tags: text("tags").array().notNull().$defaultFn(() => []),
  source: text("source").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const PRESSURE_SLOTS = ["manana", "tarde", "noche"] as const;
export type PressureSlot = (typeof PRESSURE_SLOTS)[number];

export const pressureReadings = pgTable(
  "pressure_readings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    day: date("day", { mode: "string" }).notNull(),
    slot: text("slot").notNull(),
    systolic: integer("systolic").notNull(),
    diastolic: integer("diastolic").notNull(),
    pulse: integer("pulse"),
    note: text("note").notNull().default(""),
    takenAt: timestamp("taken_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("pressure_day_slot_idx").on(t.day, t.slot)]
);

export const reminders = pgTable(
  "reminders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    everyAmount: integer("every_amount").notNull().default(1),
    everyUnit: text("every_unit").notNull().default("day"),
    nextAt: timestamp("next_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("reminders_next_at_idx").on(t.nextAt)]
);

export const activityLog = pgTable("activity_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actor: text("actor").notNull().default("yo"),
  section: text("section").notNull(),
  action: text("action").notNull(),
  summary: text("summary").notNull(),
  refId: text("ref_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
