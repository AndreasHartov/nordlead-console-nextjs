// app/layout.tsx
export const metadata = {
  title: "NordLead Console",
  description: "Operator console for NordLead",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>NordLead Console</div>
          <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/" style={{ textDecoration: "none" }}>Home</a>
            <a href="/dashboard" style={{ textDecoration: "none" }}>Dashboard</a>
            <a href="/site" style={{ textDecoration: "none" }}>Site</a>
            <a href="/plan" style={{ textDecoration: "none" }}>Plan</a>
            <a href="/crm" style={{ textDecoration: "none" }}>CRM</a>
            <a href="/finance" style={{ textDecoration: "none" }}>Finance</a>
            <a href="/compliance" style={{ textDecoration: "none" }}>Compliance</a>
            <a href="/ops" style={{ textDecoration: "none" }}>Ops</a>
            <a href="/chatops" style={{ textDecoration: "none" }}>ChatOps</a>
          </nav>
        </header>
        <main style={{ padding: "16px 20px" }}>{children}</main>
      </body>
    </html>
  );
}
