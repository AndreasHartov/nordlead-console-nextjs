// app/crm/page.tsx
import dynamic from "next/dynamic";

const CRMInbox = dynamic(() => import("../../components/CRMInbox"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>CRM</h1>
      <p>Lead inbox & bad-lead refund queue. v0 uses a mock API and local export (CSV). No live Stripe mutations yet.</p>
      <CRMInbox />
    </div>
  );
}
