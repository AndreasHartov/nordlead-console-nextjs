// app/finance/page.tsx
import dynamic from "next/dynamic";

const FinancePayouts = dynamic(() => import("../../components/FinancePayouts"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>Finance</h1>
      <p>Stripe payouts overview (last 10). Auto-refreshes every 60s.</p>
      <FinancePayouts />
    </div>
  );
}
