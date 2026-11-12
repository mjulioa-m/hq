CREATE TABLE "pressure_readings" (
	"id" text PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"slot" text NOT NULL,
	"systolic" integer NOT NULL,
	"diastolic" integer NOT NULL,
	"pulse" integer,
	"note" text DEFAULT '' NOT NULL,
	"taken_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pressure_day_slot_idx" ON "pressure_readings" USING btree ("day","slot");
