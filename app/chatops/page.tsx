// app/chatops/page.tsx
import dynamic from "next/dynamic";

const ChatOpsConsole = dynamic(() => import("../../components/ChatOpsConsole"), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1>ChatOps</h1>
      <p>
        Deterministic command console for quick ops checks. Try <code>/help</code>.
      </p>
      <ChatOpsConsole />
    </div>
  );
}
