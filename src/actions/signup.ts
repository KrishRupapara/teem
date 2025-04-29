"use server";

import { checkEmailAvailability, verifyEmailInput } from "@/lib/server/email";
import {
    createEmailVerificationRequest,
    sendVerificationEmail,
    setEmailVerificationRequestCookie,
} from "@/lib/server/email-verification";
import { verifyPasswordStrength } from "@/lib/server/passowrd";
import { RefillingTokenBucket } from "@/lib/server/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/request";
import {
    createSession,
    generateSessionToken,
    SessionFlags,
    setSessionTokenCookie,
} from "@/lib/server/session";
import { createUser, verifyUsernameInput } from "@/lib/server/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export async function SignUpAction(
    _prev: ActionResult,
    formData: FormData
): Promise<ActionResult> {
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

    if (!verifyUsernameInput(username)) return { message: "Invalid username" };

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) return { message: "Weak Password" };

    if (clientIP !== null && !ipBucket.consume(clientIP, 1))
        return { message: "Too many requests" };

    const user = await createUser(email, username, password);
    const emailVerificationRequest = await createEmailVerificationRequest(
        user.id,
        user.email
    );

    await sendVerificationEmail(
        emailVerificationRequest.email,
        emailVerificationRequest.code
    );
    await setEmailVerificationRequestCookie(emailVerificationRequest);

    const sessionFlags: SessionFlags = {
        twoFactorVerified: false,
    };

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, sessionFlags);

    await setSessionTokenCookie(sessionToken, session.expiresAt);

    return redirect("/auth/2fa/setup");
}

interface ActionResult {
    message: string;
}
