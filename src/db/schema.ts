import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('Users', {
  id: integer().primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const files = sqliteTable('Files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  path: text('path').notNull().unique(),
  sha: text('sha').unique(),
  extension: text('extension'),
  category: text('category', {
    enum: ['Document', 'Image', 'Video', 'Audio', 'Others'],
  }).default('Others'),
  userId: integer('userId')
    .notNull()
    .references(() => users.id),
});

export const fileMetadatas = sqliteTable('FileMetadatas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  extension: text('extension').notNull(),
  size: integer('size').notNull(),
  creationTime: text('creationTime').notNull(),
  mime: text('mime').notNull(),
  fileId: integer('fileId')
    .notNull()
    .references(() => files.id)
    .unique(),
});

// !! THIS IS V1 RELATION IN DRIZZLE,
// !! I CANT USE V2 EVEN THOUGH I UPGRADED FOR SOME REASON

export const filesRelations = relations(files, ({ one }) => ({
  fileMetadatas: one(fileMetadatas, {
    fields: [files.id],
    references: [fileMetadatas.fileId],
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const usersToFilesRelation = relations(users, ({ one, many }) => ({
  files: many(files),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const filesToUserRelation = relations(files, ({ one, many }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));
// this is v2
// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// export const usersToFilesRelation = defineRelations({ users, files }, (r) => ({
//   users: {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//     files: r.many.files({
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//       from: r.users.id,
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//       to: r.files.userId,
//     }),
//   },
// }));
