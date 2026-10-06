-- Inquiry -> client link + quote workflow columns.
ALTER TABLE `inquiries` ADD `client_id` text;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `quote_amount` integer;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `quote_details` text;--> statement-breakpoint

-- Contract workflow columns (inquiry link, terms, submitted flag).
-- Note: new billboard defaults/status default ('pending') apply to new rows only.
ALTER TABLE `contracts` ADD `inquiry_id` text;--> statement-breakpoint
ALTER TABLE `contracts` ADD `terms` text;--> statement-breakpoint
ALTER TABLE `contracts` ADD `submitted` integer DEFAULT 0 NOT NULL;
