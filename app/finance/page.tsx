// app/finance/page.tsx
import dynamic from "next/dynamic";

const FinanceBalance = dynamic(() => import("../../components/FinanceBalance"), { ssr: false });
const FinancePayoutSchedule = dynamic(() => import("../../components/FinancePayoutSchedule"), { ssr: false });
const FinancePayouts = dynamic(() => import("../../components/FinancePayouts"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>Finance</h1>
      <p>Stripe payouts overview (last 10) + Balance and payout schedule. Auto-refresh on some widgets.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <FinanceBalance />
        <FinancePayoutSchedule />
      </div>

      <FinancePayouts />
    </div>
  );
}
