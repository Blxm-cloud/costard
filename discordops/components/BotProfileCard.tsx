"use client";

import Image from "next/image";
import { useBotToken } from "@/context/BotTokenContext";

export function BotProfileCard() {
  const { bot, guilds, logout } = useBotToken();
  if (!bot) return null;

  const avatarUrl = bot.avatar
    ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="glass-panel flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <Image
          src={avatarUrl}
          alt={bot.username}
          width={48}
          height={48}
          className="rounded-full border border-blurple/40"
        />
        <div>
          <p className="font-semibold text-slate-100">
            {bot.username}
            <span className="text-slate-500">#{bot.discriminator}</span>
          </p>
          <p className="font-mono text-xs text-slate-500">{bot.id}</p>
          <p className="text-xs text-emerald-400">{guilds.length} serveur(s) connecté(s)</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:border-danger/50 hover:text-red-300"
      >
        Déconnecter
      </button>
    </div>
  );
}
