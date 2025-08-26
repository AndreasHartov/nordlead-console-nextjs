// lib/auth.ts
// FULL FILE — minimal operator gate for API routes.
import { headers } from "next/headers";

export type OperatorUser = { role: "operator"; id: string };

/**
 * Protect operator-only endpoints.
 * - Set OPERATOR_API_KEY in Vercel (Preview + Production).
 * - Clients call protected APIs with header: x-operator-key: <OPERATOR_API_KEY>.
 * Returns an OperatorUser on success, otherwise null.
 */
export async function authGuard(
  required: "operator" | "any" = "operator"
): Promise<OperatorUser | { role: "any" } | null> {
  if (required !== "operator") return { role: "any" };
  const h = await headers();
  const key = h.get("x-operator-key");
  const expected = process.env.OPERATOR_API_KEY;
  if (!expected || key !== expected) return null;
  return { role: "operator", id: "operator/api-key" };
}
