"use server";

import { checkEmailAvailability, verifyEmailInput } from "@/lib/server/email";
import { RefillingTokenBucket } from "@/lib/server/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/request";
import { headers } from "next/headers";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export async function SignUpAction(_prev: ActionResult, formData: FormData) {
  if (!globalPOSTRateLimit()) return { message: "Too many requests" };

  const clientIP = (await headers()).get("X-Forwaded-For");
  if (clientIP !== null && !ipBucket.check(clientIP, 1))
    return { message: "Too many requests" };

  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  )
    return { message: "Invalid or missing fields" };

  if (email === "" || username === "" || password === "")
    return { message: "Please Enter your username, email and password" };

  if (!verifyEmailInput(email)) return { message: "Invalid email" };

  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) return { message: "Email is already used" };
}

interface ActionResult {
  message: string;
}
