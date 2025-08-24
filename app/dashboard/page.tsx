// app/dashboard/page.tsx
import dynamic from "next/dynamic";

// relative imports (avoid alias issues)
const HealthWidget = dynamic(() => import("../../components/HealthWidget"), { ssr: false });
const MetricsWidget = dynamic(() => import("../../components/MetricsWidget"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Live metrics (mock) + API health. Metrics refresh every 30s.</p>

      {/* Metrics */}
      <MetricsWidget />

      {/* Health */}
      <div style={{ marginTop: 16 }}>
        <HealthWidget />
      </div>
    </div>
  );
}
