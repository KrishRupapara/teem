import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passowrd: text(),
  picture: text(),
  organization: text(),
  profession: text(),
  country: text(),
  createdAt: timestamp().defaultNow(),
  isVerified: boolean().default(false),
  isConnectedToGoogle: boolean().default(false),
  googleId: text(),
});

export const sessionTable = pgTable("session", {
  id: text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => userTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  isVerified: boolean().default(false)
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
