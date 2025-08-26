// lib/db.ts
// FULL FILE — minimal Neon client with relaxed typing.
// Env: DATABASE_URL
import { neon } from "@neondatabase/serverless";

// Cast to any so TypeScript doesn't complain about the number of placeholders
// in tagged template calls (we use many in UPDATE statements).
export const sql: any = neon(process.env.DATABASE_URL!);

// Usage examples:
//   const rows = await sql`select 1 as ok`;
//   const items = await sql<{ id: string }>`select id from refunds limit 10`;
