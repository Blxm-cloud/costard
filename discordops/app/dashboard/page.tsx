"use client";

import { redirect } from "next/navigation";
import { useBotToken } from "@/context/BotTokenContext";
import { BotProfileCard } from "@/components/BotProfileCard";
import { EmbedOrchestrator } from "@/components/EmbedOrchestrator";
import { PermissionsAuditor } from "@/components/PermissionsAuditor";

export default function DashboardPage() {
  const { bot, isVerifying } = useBotToken();

  if (!bot && !isVerifying) redirect("/");

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      {bot ? (
        <>
          <BotProfileCard />
          <PermissionsAuditor />
          <EmbedOrchestrator />
        </>
      ) : (
        <p className="text-sm text-slate-500">Chargement de la session…</p>
      )}
    </main>
  );
}
