"use client";

import { useBotToken } from "@/context/BotTokenContext";
import { hasPermission, PERMISSIONS } from "@/lib/discord";

export function PermissionsAuditor() {
  const { guilds } = useBotToken();

  return (
    <div className="glass-panel space-y-4 p-6">
      <h3 className="font-mono text-sm font-semibold text-blurple-light">
        // PERMISSIONS AUDITOR
      </h3>

      <div className="space-y-2">
        {guilds.map((g) => {
          const isAdmin = hasPermission(g.permissions, PERMISSIONS.ADMINISTRATOR);
          const canSend = hasPermission(g.permissions, PERMISSIONS.SEND_MESSAGES);
          const canEmbed = hasPermission(g.permissions, PERMISSIONS.EMBED_LINKS);
          const missingCritical = !canSend || !canEmbed;

          return (
            <div
              key={g.id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-800 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{g.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{g.id}</p>
              </div>

              <div className="flex gap-2">
                {isAdmin && (
                  <span className="rounded-full border border-danger/40 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold text-red-300 shadow-glow-danger">
                    ⚠ ADMINISTRATOR
                  </span>
                )}
                {missingCritical && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                    ⚠ Permissions manquantes
                  </span>
                )}
                {!isAdmin && !missingCritical && (
                  <span className="rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-glow-emerald">
                    ✓ Sain
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {guilds.length === 0 && (
          <p className="text-xs text-slate-500">Aucun serveur à analyser.</p>
        )}
      </div>

      <div className="rounded-lg border border-white/5 bg-ink-800/50 p-3 text-[11px] leading-relaxed text-slate-500">
        <strong className="text-slate-400">ADMINISTRATOR</strong> donne un accès total et
        contourne toutes les autres permissions — à éviter sauf nécessité absolue.{" "}
        <strong className="text-slate-400">SEND_MESSAGES</strong> et{" "}
        <strong className="text-slate-400">EMBED_LINKS</strong> sont requis pour
        l&apos;Embed Orchestrator.
      </div>
    </div>
  );
}
