// app/crm/page.tsx
import dynamic from "next/dynamic";

const CRMInbox = dynamic(() => import("../../components/CRMInbox"), { ssr: false });
const CRMPartners = dynamic(() => import("../../components/CRMPartners"), { ssr: false });
const CRMAssigned = dynamic(() => import("../../components/CRMAssigned"), { ssr: false });

export default function Page() {
  return (
    <div>
      <h1>CRM</h1>
      <p>Inbox → Assign to partners or queue bad-lead refunds. Data stays local (safe) and is exportable as CSV.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CRMPartners />
        <CRMAssigned />
      </div>

      <div style={{ marginTop: 12 }}>
        <CRMInbox />
      </div>
    </div>
  );
}
