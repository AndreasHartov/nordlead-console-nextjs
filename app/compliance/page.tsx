// app/compliance/page.tsx
import dynamic from "next/dynamic";

const VATWatcher = dynamic(() => import("../../components/VATWatcher"), { ssr: false });
const ComplianceChecklist = dynamic(() => import("../../components/ComplianceChecklist"), { ssr: false });
const FinancePayoutSchedule = dynamic(() => import("../../components/FinancePayoutSchedule"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>Compliance</h1>
      <p>Keep the business compliant while we scale. VAT watcher is for the DK 50,000 kr threshold; payout cadence is read-only from Stripe.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <VATWatcher />
        <FinancePayoutSchedule />
      </div>

      <ComplianceChecklist />
    </div>
  );
}
