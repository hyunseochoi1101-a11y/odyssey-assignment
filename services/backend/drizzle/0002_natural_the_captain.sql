ALTER TABLE "menu_items" ADD COLUMN "prep_time_minutes" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_prep_time_minutes" integer DEFAULT 0 NOT NULL;