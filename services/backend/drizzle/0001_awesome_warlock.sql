CREATE TYPE "public"."order_status" AS ENUM('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "ordering_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_name" text DEFAULT 'Odyssey Kitchen' NOT NULL,
	"prep_time_minutes" integer DEFAULT 20 NOT NULL,
	"auto_accept_orders" boolean DEFAULT false NOT NULL,
	"ordering_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";