CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`ref` text NOT NULL,
	`title` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`diet` text DEFAULT 'Vegetarian' NOT NULL,
	`deadline` text,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'saved' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activities_user_ref` ON `activities` (`user_id`,`ref`);