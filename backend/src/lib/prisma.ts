import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon's driver needs a WebSocket implementation in Node.js (Lambda runtimes
// aren't guaranteed to have a stable global WebSocket) — see backend-spec.md
// > Database: Neon's pooling is why this adapter (HTTP/WebSocket, no TCP
// handshake per invocation) fits Lambda better than a raw `pg` connection.
neonConfig.webSocketConstructor = ws;

// Reuse the client across hot reloads / warm Lambda invocations instead of
// exhausting connections by creating a new one per request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
