import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  sessionTable,
  User,
  userTable,
  type Session,
} from "../../db/schema/user";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { cookies } from "next/headers";

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const row = await db
    .select()
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId))
    .limit(1);

  if (row.length == 0) return { session: null, user: null };

  const session = row[0].session;
  const user = row[0].user;

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionTable.id, session.id));

    return { session, user };
  }

  return { session, user };
}

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value ?? null;

  if (token == null) return { session: null, user: null };

  const result = await validateSessionToken(token);

  return result;
});

export async function invalidateSession(sessionId: string) {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number) {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export async function deleteSessionTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();

  return token;
}

export async function createSession(
  token: string,
  userId: number,
  flags: SessionFlags
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    isVerified: flags.isVerified,
  };

  await db.insert(sessionTable).values(session);

  return session;
}

export async function setSessionAs2FAVerified(
  sessionId: string
): Promise<void> {
  await db
    .update(sessionTable)
    .set({ isVerified: true })
    .where(eq(sessionTable.id, sessionId));
}

export interface SessionFlags {
  isVerified: boolean;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
