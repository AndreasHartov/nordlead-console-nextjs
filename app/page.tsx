export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", lineHeight: 1.5 }}>
      <h1>NordLead Console</h1>
      <p>Scaffold OK. You can deploy features now.</p>
      <ul>
        <li><a href="/success">Success page</a></li>
        <li><a href="/cancel">Cancel page</a></li>
        <li><a href="/api/health">Health endpoint</a></li>
      </ul>
    </main>
  );
}