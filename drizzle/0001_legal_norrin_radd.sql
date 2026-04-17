CREATE TABLE `module_completion` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_slug` text NOT NULL,
	`time_spent_seconds` integer NOT NULL,
	`data` text,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `module_submission` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_slug` text NOT NULL,
	`module_id` text NOT NULL,
	`module_type` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
