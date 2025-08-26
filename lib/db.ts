// lib/db.ts
// FULL FILE — minimal Neon client.
// Requires env var: DATABASE_URL
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
// Usage examples:
//   const rows = await sql`select 1 as ok`;
//   const items = await sql<{ id: string }>`select id from refunds limit 10`;
