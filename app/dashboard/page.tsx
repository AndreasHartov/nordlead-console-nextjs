// app/dashboard/page.tsx
import dynamic from "next/dynamic";
import StatCard from "../../components/StatCard";

// Client component (HealthWidget) must be dynamic to avoid SSR warnings here
const HealthWidget = dynamic(
  () => import("../../components/HealthWidget"),
  { ssr: false }
);

export default function Page() {
  const stats = [
    { label: "MRR (DKK)", value: "—", hint: "Hook to Stripe later" },
    { label: "CPL avg (DKK)", value: "—", hint: "By trade — later" },
    { label: "Refund rate", value: "—", hint: "Last 7 days" },
    { label: "VAT runway (days)", value: "—", hint: "Cash / burn" },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p>First cut: placeholders for KPIs and a live health check.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          margin: "16px 0 24px",
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} />
        ))}
      </div>

      <HealthWidget />
    </div>
  );
}
