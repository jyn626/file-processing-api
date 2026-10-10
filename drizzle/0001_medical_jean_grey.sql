CREATE TABLE `ProcessingJobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'QUEUED',
	`fileId` integer NOT NULL,
	`errorMessage` text,
	FOREIGN KEY (`fileId`) REFERENCES `Files`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `Users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ProcessingJobs_fileId_unique` ON `ProcessingJobs` (`fileId`);