CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text DEFAULT 'yo' NOT NULL,
	"section" text NOT NULL,
	"action" text NOT NULL,
	"summary" text NOT NULL,
	"ref_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"type" text DEFAULT 'nota' NOT NULL,
	"summary" text NOT NULL,
	"happened_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"stage" text DEFAULT 'lead' NOT NULL,
	"value" numeric(14, 2),
	"next_action" text DEFAULT '' NOT NULL,
	"next_action_date" date,
	"notes" text DEFAULT '' NOT NULL,
	"won_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"piece_id" text NOT NULL,
	"stage" text NOT NULL,
	"kind" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"url" text,
	"file_path" text,
	"is_chosen" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_pieces" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"platform" text NOT NULL,
	"format" text DEFAULT 'video' NOT NULL,
	"title" text NOT NULL,
	"current_stage" text DEFAULT 'idea' NOT NULL,
	"status" text DEFAULT 'en_marcha' NOT NULL,
	"planned_date" date,
	"published_at" timestamp,
	"published_url" text,
	"metrics" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_references" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"platform" text NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"views" integer,
	"published_on" date,
	"tag" text DEFAULT 'competencia' NOT NULL,
	"useful" boolean,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_stage_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"piece_id" text NOT NULL,
	"stage" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_notes" (
	"date" date PRIMARY KEY NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"title" text NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"options" jsonb NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"outcome" text DEFAULT '' NOT NULL,
	"due_date" date,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'COP' NOT NULL,
	"category" text DEFAULT 'Otros' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"entry_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learnings" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"tags" text[] NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" text DEFAULT '#f0c7a6' NOT NULL,
	"scene_slug" text DEFAULT 'proyectos' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"project_id" text,
	"due_date" date,
	"priority" text DEFAULT 'normal' NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_piece_id_content_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."content_pieces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_references" ADD CONSTRAINT "content_references_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_stage_notes" ADD CONSTRAINT "content_stage_notes_piece_id_content_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."content_pieces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_stage_piece_idx" ON "content_stage_notes" USING btree ("piece_id","stage");--> statement-breakpoint
CREATE INDEX "tasks_done_due_idx" ON "tasks" USING btree ("done","due_date");