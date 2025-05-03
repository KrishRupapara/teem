import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Button>
                <Link href={"/auth/sign-up"}>Please Sign-Up</Link>
            </Button>
        </div>
    );
}
