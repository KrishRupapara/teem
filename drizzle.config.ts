import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  dialect: "postgresql",
  schema: ["./src/db/schema/*.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  out: "./src/model",
} satisfies Config;
