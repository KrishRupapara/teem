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
import { formStateToError, toFormState } from "@/utils/form-message";
import { SignUpSchema } from "@/utils/form-schema";
import { headers } from "next/headers";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export async function SignUpAction(_prev: ActionResult, formData: FormData) {
    try {
        if (!globalPOSTRateLimit())
            return toFormState("ERROR", "Too many requests");

        const clientIP = (await headers()).get("X-Forwaded-For");
        if (clientIP !== null && !ipBucket.check(clientIP, 1))
            return toFormState("ERROR", "Too many requests");

        const data = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        const result = SignUpSchema.parse(data);

        const emailAvailable = await checkEmailAvailability(result.email);
        if (!emailAvailable)
            return toFormState("ERROR", "Email is already used");

        // const strongPassword = await verifyPasswordStrength(password);
        // if (!strongPassword) return { message: "Weak Password" };

        if (clientIP !== null && !ipBucket.consume(clientIP, 1))
            return toFormState("ERROR", "Too many requests");

        const user = await createUser(
            result.email,
            result.username,
            result.password
        );
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
        const session = await createSession(
            sessionToken,
            user.id,
            sessionFlags
        );

        await setSessionTokenCookie(sessionToken, session.expiresAt);

        return toFormState("SUCCESS", "Signup Successful!");
    } catch (err: unknown) {
        console.error("Error is", err);
        return formStateToError(err);
    }
}

interface ActionResult {
    message: string;
}
