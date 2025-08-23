import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NordLead Console",
  description: "Minimal scaffold for clean deploy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui", lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  );
}
