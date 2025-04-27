import { headers } from "next/headers";
import { RefillingTokenBucket } from "./rate-limit";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export async function globalGETRateLimit() {
  const clientIP = (await headers()).get("X-Forwaded-For");
  if (clientIP == null) return true;

  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit() {
  const clientIP = (await headers()).get("X-Forwaded-For");
  if (clientIP == null) return true;

  return globalBucket.consume(clientIP, 3);
}
