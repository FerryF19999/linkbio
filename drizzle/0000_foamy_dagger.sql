CREATE TABLE `profiles` (
	`public_id` text PRIMARY KEY NOT NULL,
	`edit_token_hash` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL
);
