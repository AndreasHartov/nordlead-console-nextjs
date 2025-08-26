// app/api/refunds/[id]/route.ts
// FULL FILE — do not trim.

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { authGuard } from "@/lib/auth";

export const dynamic = "force-dynamic";

function looksLikeUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const user = await authGuard("operator");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = ctx.params.id;
  if (!looksLikeUuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const refundRows = await sql`
    select * from refunds where id = ${id}
  `;
  if (!refundRows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const refund = refundRows[0];

  const events = await sql`
    select type, payload, created_at
    from refund_events
    where refund_id = ${id}
    order by id asc
  `;

  return NextResponse.json({ refund, events });
}
