CREATE TABLE "reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"every_amount" integer DEFAULT 1 NOT NULL,
	"every_unit" text DEFAULT 'day' NOT NULL,
	"next_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "reminders_next_at_idx" ON "reminders" USING btree ("next_at");
