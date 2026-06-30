"use client";

import { redirect } from "next/navigation";
import { useBotToken } from "@/context/BotTokenContext";
import { TokenInput } from "@/components/TokenInput";

export default function HomePage() {
  const { bot } = useBotToken();
  if (bot) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="font-mono text-4xl font-black tracking-tight text-white">
          Discord<span className="text-blurple-light">Ops</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Centre de commande pour bots Discord. Puissance, sécurité, zéro compromis.
        </p>
      </div>
      <TokenInput />
    </main>
  );
}
