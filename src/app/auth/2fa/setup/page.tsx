import { getCurrentSession } from "@/lib/server/session";
import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { redirect } from "next/navigation";
import { renderSVG } from "uqr";

export default async function Page() {
    const { session, user } = await getCurrentSession();

    if (session === null || user === null) return redirect("/auth/login");

    if (!user.emailVerified) return redirect("/auth/verify-email");

    if (user.totpKey && !session.twoFactorVerified)
        return redirect("/auth/2fa");

    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI("Demo", user.username, totpKey, 30, 6);
    const qrcode = renderSVG(keyURI);

    return (
        <>
            <h1>Set up two-factor authentication</h1>
            <div
                className="w-[200px] h-[200px]"
                dangerouslySetInnerHTML={{ __html: qrcode }}
            ></div>
        </>
    );
}
