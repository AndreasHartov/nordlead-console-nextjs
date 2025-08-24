// app/api/crm/leads/route.ts
import { NextResponse } from "next/server";

type Lead = {
  id: string;
  createdAt: string; // ISO
  name: string;
  phone?: string;
  email?: string;
  trade: "VVS" | "Elektriker" | "Tømrer" | "Tag" | "Vinduer&Døre";
  city?: string;
  zip?: string;
  description?: string;
  cplDkk?: number;
  source?: string; // e.g. "site"
};

const leads: Lead[] = [
  {
    id: "L-240824-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    name: "Mikkel Jensen",
    phone: "+45 20 11 22 33",
    email: "mikkel@example.com",
    trade: "VVS",
    city: "Hellerup",
    zip: "2900",
    description: "Dryppende blandingsbatteri på badeværelse.",
    cplDkk: 250,
    source: "site",
  },
  {
    id: "L-240824-002",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    name: "Sofie Larsen",
    phone: "+45 26 34 12 98",
    email: "sofie@example.com",
    trade: "Elektriker",
    city: "Frederiksberg",
    zip: "2000",
    description: "Opsætning af ekstra stikkontakter i køkken.",
    cplDkk: 250,
    source: "site",
  },
  {
    id: "L-240824-003",
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    name: "Kasper Holm",
    phone: "+45 27 88 66 55",
    email: "kasper@example.com",
    trade: "Tag",
    city: "Rødovre",
    zip: "2610",
    description: "Reparation af tag – mistanke om utætning.",
    cplDkk: 500,
    source: "site",
  },
];

export async function GET() {
  return NextResponse.json(
    { ok: true, count: leads.length, items: leads, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
