CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`format` text NOT NULL,
	`start_date` text,
	`duration` text NOT NULL,
	`message` text,
	`created_at` integer NOT NULL
);
