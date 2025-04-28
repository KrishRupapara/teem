import SignUpComponent from "@/components/auth/SignUp";
import { globalGETRateLimit } from "@/lib/server/request";
import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function Page() {
    if (!globalGETRateLimit()) return "too many requests";

    const { user, session } = await getCurrentSession();

    if (session !== null) {
        if (!user.emailVerified) return redirect("/auth/verify-email");

        if (!user.totpKey) return redirect("/auth/2fa/setup");

        if (!session.twoFactorVerified) return redirect("/auth/2fa");
    }

    return <SignUpComponent />;
}
