// app/ops/page.tsx
import dynamic from "next/dynamic";

const SLAClock = dynamic(() => import("../../components/SLAClock"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>Ops</h1>
      <p>Live SLA status for Europe/Copenhagen.</p>
      <SLAClock />
    </div>
  );
}
