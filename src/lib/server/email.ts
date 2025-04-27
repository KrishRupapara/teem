import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { eq } from "drizzle-orm";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const res = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  return res.length === 0;
}
