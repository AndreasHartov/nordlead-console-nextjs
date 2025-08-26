// lib/db.ts
// FULL FILE — Neon HTTP driver bound to DATABASE_URL.
// Requires env var: DATABASE_URL (already present via Neon ↔ Vercel link).
import { neon } from "@neondatabase/serverless";

/**
 * Usage:
 *   const rows = await sql`select 1 as ok`;
 *   const one  = await first<{ ok: number }>`select 1 as ok`;
 */
export const sql = neon(process.env.DATABASE_URL!);

// Helper to fetch exactly one row (throws if none).
export async function first<T = any>(query: TemplateStringsArray, ...args: any[]): Promise<T> {
  const rows = await sql<T>(query, ...args);
  if (!rows || rows.length === 0) throw new Error("Not found");
  return rows[0] as T;
}

// Helper to fetch many rows.
export async function many<T = any>(query: TemplateStringsArray, ...args: any[]): Promise<T[]> {
  const rows = await sql<T>(query, ...args);
  return rows as T[];
}
