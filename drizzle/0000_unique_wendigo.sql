CREATE TABLE `FileMetadatas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`extension` text NOT NULL,
	`size` integer NOT NULL,
	`creationTime` text NOT NULL,
	`mime` text NOT NULL,
	`fileId` integer NOT NULL,
	FOREIGN KEY (`fileId`) REFERENCES `Files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `FileMetadatas_fileId_unique` ON `FileMetadatas` (`fileId`);--> statement-breakpoint
CREATE TABLE `Files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`sha` text,
	`extension` text,
	`category` text DEFAULT 'Others',
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Files_path_unique` ON `Files` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `Files_sha_unique` ON `Files` (`sha`);--> statement-breakpoint
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Users_username_unique` ON `Users` (`username`);