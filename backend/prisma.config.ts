import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrate/introspect use a direct (unpooled) connection — Neon's pooled
// connection (DATABASE_URL, used by the app at runtime via @prisma/adapter-neon)
// doesn't reliably support the advisory locks DDL migrations take.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
