import { db } from "@/db";
import { generateRandomRecoveryCode } from "../utils";
import { decrypt, decryptToString, encrypt, encryptString } from "./encryption";
import { hashPassword } from "./passowrd";
import { userTable } from "@/db/schema/user";
import { and, eq } from "drizzle-orm";

export function verifyUsernameInput(username: string) {
    return (
        username.length > 3 &&
        username.length < 32 &&
        username.trim() === username
    );
}

export async function createUser(
    email: string,
    username: string,
    password: string
) {
    const passwordHash = await hashPassword(password);
    const recoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(recoveryCode);

    const row = await db
        .insert(userTable)
        .values({
            email: email,
            username: username,
            passowrd: passwordHash,
            recoveryCode: encryptedRecoveryCode,
        })
        .returning();

    if (row.length === 0 || row === null) throw new Error("Unexpected Error");

    const user = {
        id: row[0]["id"],
        name: row[0]["username"],
        email: row[0]["email"],
        isVerified: false,
        registered2FA: false,
    };

    return user;
}

export async function updateUserPassword(userId: number, password: string) {
    const passwordHash = await hashPassword(password);

    await db
        .update(userTable)
        .set({ passowrd: passwordHash })
        .where(eq(userTable.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
    userId: number,
    email: string
) {
    await db
        .update(userTable)
        .set({ email: email, emailVerified: true })
        .where(eq(userTable.id, userId));
}

export async function setUserAsVerifiedIfEmailMatches(
    userId: number,
    email: string
) {
    await db
        .update(userTable)
        .set({ emailVerified: true })
        .where(and(eq(userTable.id, userId), eq(userTable.email, email)));
}

export async function getUserPasswordHash(userId: number) {
    const row = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

    if (row.length === 0) throw new Error("Invalid User ID");

    return row[0]["passowrd"];
}

export async function getUserRecoveryCode(userId: number) {
    const row = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

    if (row.length === 0) throw new Error("Invalid User ID");
    return decryptToString(row[0]["recoveryCode"]);
}

export async function getUserTOTPKey(userId: number) {
    const row = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

    if (row.length === 0) throw new Error("Invalid User ID");

    if (row[0]["totpKey"] === null) return null;

    return decrypt(row[0]["totpKey"]);
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array) {
    const encrypted = encrypt(key);

    await db
        .update(userTable)
        .set({ totpKey: encrypted })
        .where(eq(userTable.id, userId));
}

export async function resetUserRecoveryCode(userId: number) {
    const recoveryCode = generateRandomRecoveryCode();
    const encrypted = encryptString(recoveryCode);

    await db
        .update(userTable)
        .set({ recoveryCode: encrypted })
        .where(eq(userTable.id, userId));
    return recoveryCode;
}

export async function getUserFromEmail(email: string) {
    const row = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

    if (row.length === 0) return null;

    const user = {
        id: row[0]["id"],
        email: row[0]["email"],
        name: row[0]["username"],
        isVerified: row[0]["emailVerified"],
        registered2FA: row[0]["totpKey"] ? true : false,
    };

    return user;
}

export interface User {
    id: number;
    email: string;
    username: string;
    emailVerified: boolean;
    registered2FA: boolean;
}
