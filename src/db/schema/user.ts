import { InferSelectModel } from "drizzle-orm";
import {
    boolean,
    customType,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

const bytea = customType<{
    data: Uint8Array;
    notNull: false;
    default: false;
}>({
    dataType() {
        return "bytea";
    },
});

export const userTable = pgTable("user", {
    id: serial().primaryKey(),
    email: text().notNull().unique(),
    username: text().notNull(),
    passowrd: text(),
    picture: text(),
    organization: text(),
    profession: text(),
    country: text(),
    createdAt: timestamp().defaultNow(),
    emailVerified: boolean().default(false),
    totpKey: bytea(),
    recoveryCode: bytea().notNull(),
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
    twoFactorVerified: boolean().default(false),
});

export const emailVerificationRequestTable = pgTable(
    "email_verification_request",
    {
        id: text().primaryKey(),
        userId: integer()
            .notNull()
            .references(() => userTable.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        email: text().notNull(),
        code: text().notNull(),
        expiresAt: timestamp("expires_at", {
            withTimezone: true,
            mode: "date",
        }).notNull(),
    }
);

export const passwordResetSessionTable = pgTable("password_reset_session", {
    id: text().primaryKey(),
    userId: integer()
        .notNull()
        .references(() => userTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
    email: text().notNull(),
    code: text().notNull(),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    emailVerified: boolean().default(false),
    twoFactorVerified: boolean().default(false),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type emailVerificationRequest = InferSelectModel<
    typeof emailVerificationRequestTable
>;
export type passwordResetSession = InferSelectModel<
    typeof passwordResetSessionTable
>;
