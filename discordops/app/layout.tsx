import type { Metadata } from "next";
import "./globals.css";
import { BotTokenProvider } from "@/context/BotTokenContext";

export const metadata: Metadata = {
  title: "DiscordOps — Bot Command Center",
  description: "Pilote tes bots Discord avec puissance, sécurité et style cyberpunk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen antialiased">
        <BotTokenProvider>{children}</BotTokenProvider>
      </body>
    </html>
  );
}
