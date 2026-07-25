import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  publicId: text("public_id").primaryKey(),
  editTokenHash: text("edit_token_hash").notNull(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
