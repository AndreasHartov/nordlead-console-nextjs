// components/StatCard.tsx
type Props = {
  label: string;
  value: string;
  hint?: string;
};

export default function StatCard({ label, value, hint }: Props) {
  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: 10,
      padding: "14px 16px",
      minWidth: 180,
      background: "#fff"
    }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {hint ? <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>{hint}</div> : null}
    </div>
  );
}
