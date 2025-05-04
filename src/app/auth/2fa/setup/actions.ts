import { RefillingTokenBucket } from "@/lib/server/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/request";
import {
    getCurrentSession,
    setSessionAs2FAVerified,
} from "@/lib/server/session";
import { decodeBase64 } from "@oslojs/encoding";
import { verifyTOTP } from "@oslojs/otp";
import { updateUserTOTPKey } from "@/lib/server/user";

const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function setup2FAAction(_prev: ActionResult, formData: FormData) {
    if (!globalPOSTRateLimit()) return { message: "Too many requests!" };

    const { user, session } = await getCurrentSession();

    if (session === null) return { message: "Not authenticated" };
    if (!user.emailVerified) return { message: "Forbidden" };
    if (user.totpKey && !session.twoFactorVerified)
        return { message: "Forbidden" };

    if (!totpUpdateBucket.check(user.id, 1))
        return { message: "Too many requests!" };

    const encodedKey = formData.get("key");
    const code = formData.get("code");

    if (typeof encodedKey !== "string" || typeof code !== "string")
        return { message: "Missing or invalid data" };

    if (code === "") return { message: "Please Enter your code" };
    if (encodedKey.length !== 28) return { message: "Please Enter your code" };

    let key: Uint8Array;

    try {
        key = decodeBase64(encodedKey);
    } catch {
        return { message: "Invalid key!" };
    }

    if (key.byteLength !== 20) return { message: "Invalid key!" };

    if (!totpUpdateBucket.consume(user.id, 1))
        return { message: "Too many requests!" };

    if (!verifyTOTP(key, 30, 6, code)) return { message: "Invalid code" };

    await updateUserTOTPKey(session.userId, key);
    await setSessionAs2FAVerified(session.id);
}

interface ActionResult {
    message: string;
}
