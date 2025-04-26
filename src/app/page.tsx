import Link from "next/link";

export default function Home() {
  return (
    <div>
      hello world
      <Link href={"/auth/sign-up"}>Sign Up</Link>
    </div>
  );
}
