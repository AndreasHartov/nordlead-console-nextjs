// app/plan/page.tsx
import Checklist from "../../components/Checklist";

const initialItems = [
  { id: "p3-tabs", text: "Phase 3: Tabs scaffolded", done: true },
  { id: "p3-dash", text: "Dashboard v0 (KPI placeholders + Health)", done: true },
  { id: "p3-ops", text: "Ops: SLA strip + clock (v0)", done: false },
  { id: "p4-sites", text: "Public Sites v1 scaffold (5 niches)", done: false },
  { id: "p5-traffic", text: "Traffic plan (search + retargeting) drafted", done: false },
  { id: "stripe-audit", text: "Stripe audit pass (branding, receipts, notifications, payouts)", done: true },
  { id: "dns-ok", text: "DNS: apex + www verified; www→308→apex", done: true }
];

export default function Page() {
  return (
    <div>
      <h1>Plan</h1>
      <p>This is our working checklist and “run” panel. Tasks are stored locally in your browser (persistent on refresh).</p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(320px, 1fr)" }}>
        <Checklist title="Execution Checklist" storageKey="planChecklist-v1" initial={initialItems} />

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>Run</h2>
          <p>One-click actions & quick links:</p>
          <ul style={{ lineHeight: 1.9 }}>
            <li><a href="https://vercel.com/dashboard" target="_blank">Vercel dashboard</a> → project <b>nordlead-console</b></li>
            <li><a href="https://vercel.com/dashboard?filter=production" target="_blank">Vercel Production deployments</a></li>
            <li><a href="https://github.com/AndreasHartov/nordlead-console-nextjs/edit/main/docs/business-plan.md" target="_blank">Edit business-plan.md</a></li>
            <li><a href="https://github.com/AndreasHartov/nordlead-console-nextjs/edit/main/docs/status.json" target="_blank">Edit status.json</a></li>
            <li><a href="https://dashboard.stripe.com/settings/public" target="_blank">Stripe → Public details</a></li>
            <li><a href="https://dashboard.stripe.com/settings/branding" target="_blank">Stripe → Branding</a></li>
            <li><a href="https://dashboard.stripe.com/settings/emails" target="_blank">Stripe → Receipts</a></li>
            <li><a href="https://dashboard.stripe.com/settings/communication-preferences" target="_blank">Stripe → Notifications</a></li>
            <li><a href="https://dashboard.stripe.com/settings/payouts" target="_blank">Stripe → Payouts</a></li>
            <li><a href="https://www.whatsmydns.net/#A/nord-lead.dk" target="_blank">WhatsMyDNS → A apex</a></li>
            <li><a href="https://www.whatsmydns.net/#CNAME/www.nord-lead.dk" target="_blank">WhatsMyDNS → CNAME www</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
