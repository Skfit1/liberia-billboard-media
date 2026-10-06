CREATE TABLE `billboards` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`location` text NOT NULL,
	`format` text NOT NULL,
	`width_ft` integer,
	`height_ft` integer,
	`facing` text,
	`monthly_rate` integer,
	`status` text DEFAULT 'available' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`email` text NOT NULL,
	`phone` text,
	`city` text,
	`status` text DEFAULT 'prospect' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`billboard_id` text,
	`campaign_name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`amount` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD `status` text DEFAULT 'new' NOT NULL;