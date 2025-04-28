import { db } from "@/db";
import { emailVerificationRequestTable } from "@/db/schema/user";
import { encodeBase32 } from "@oslojs/encoding";
import { and, eq } from "drizzle-orm";
import { generateRandomOTP } from "../utils";
import { emailVerificationRequest } from "../../db/schema/user";
import { cookies } from "next/headers";
import { getCurrentSession } from "./session";
import { ExpiringTokenBucket } from "./rate-limit";

export async function getUserEmailVerificationRequest(
    userId: number,
    id: string
) {
    const row = await db
        .select()
        .from(emailVerificationRequestTable)
        .where(
            and(
                eq(emailVerificationRequestTable.id, id),
                eq(emailVerificationRequestTable.userId, userId)
            )
        );

    if (row.length === 0) return null;

    return row[0];
}

export async function createEmailVerificationRequest(
    userId: number,
    email: string
) {
    await deleteUserEmailVerificationRequest(userId);

    const idBytes = new Uint8Array(20);
    crypto.getRandomValues(idBytes);
    const id = encodeBase32(idBytes).toLowerCase();

    const code = generateRandomOTP();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

    const row = await db
        .insert(emailVerificationRequestTable)
        .values({ id, userId, code, email, expiresAt })
        .returning();

    return row[0];
}

export async function deleteUserEmailVerificationRequest(userId: number) {
    await db
        .delete(emailVerificationRequestTable)
        .where(eq(emailVerificationRequestTable.userId, userId));
}

export async function sendVerificationEmail(email: string, code: string) {
    console.log(`To ${email}: Your verification code is ${code}`);
}

export async function setEmailVerificationRequestCookie(
    request: emailVerificationRequest
) {
    (await cookies()).set("email_verification", request.id, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: request.expiresAt,
    });
}

export async function deleteEmailVerificationRequestCookie() {
    (await cookies()).set("email_verification", "", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
    });
}

export async function getUserEmailVerificationRequestFromRequest() {
    const { user } = await getCurrentSession();

    if (user === null) return null;

    const id = (await cookies()).get("email_verification")?.value ?? null;

    if (id === null) return null;

    const request = await getUserEmailVerificationRequest(user.id, id);

    if (request === null) await deleteEmailVerificationRequestCookie();

    return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(
    3,
    60 * 10
);
