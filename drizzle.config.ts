import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema.pg.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? "",
  },
} satisfies Config
