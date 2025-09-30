import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();
export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  breakpoints: false,
  dbCredentials: {
    url: `${process.env.DATABASE_URL!}?sslmode=no-verify`,
  },
});
