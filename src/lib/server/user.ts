import { db } from "@/db";
import { generateRandomRecoveryCode } from "../utils";
import { encryptString } from "./encryption";
import { hashPassword } from "./passowrd";
import { userTable } from "@/db/schema/user";

export function verifyUsernameInput(username: string) {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
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

  await db.insert(userTable).values({
    email: email,
    name: username,
    passowrd: passwordHash,
    recoveryCode: encryptedRecoveryCode,
  });
}
