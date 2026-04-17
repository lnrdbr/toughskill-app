CREATE TABLE `module_view` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_slug` text NOT NULL,
	`viewed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_view_user_module_uk` ON `module_view` (`user_id`,`module_id`);