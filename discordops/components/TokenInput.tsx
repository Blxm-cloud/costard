"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBotToken } from "@/context/BotTokenContext";
import { Alert } from "@/components/ui/Alert";

export function TokenInput() {
  const { verifyAndSet, isVerifying, error } = useBotToken();
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    await verifyAndSet(value.trim());
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel scanline-overlay w-full max-w-md space-y-4 p-6"
    >
      <div>
        <h2 className="font-mono text-lg font-semibold text-blurple-light">
          // AUTHENTIFICATION BOT
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Colle un token de <span className="text-blurple-light">BOT</span> Discord uniquement.
          Jamais de token utilisateur — c&apos;est interdit par les CGU Discord.
        </p>
      </div>

      <div className="relative">
        <input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Bot token (ex: MTIzN...XYZ)"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2.5 pr-16 font-mono text-sm text-slate-100 outline-none ring-blurple/50 placeholder:text-slate-600 focus:ring-2"
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
        >
          {reveal ? "MASQUER" : "VOIR"}
        </button>
      </div>

      <button
        type="submit"
        disabled={isVerifying || !value.trim()}
        className="w-full rounded-lg bg-blurple px-4 py-2.5 font-semibold text-white shadow-glow transition hover:bg-blurple-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVerifying ? "Vérification en cours…" : "Connecter le bot"}
      </button>

      {error && <Alert variant="error">{error}</Alert>}

      <p className="text-[11px] leading-relaxed text-slate-500">
        🔒 Le token n&apos;est jamais stocké en clair ni en base de données. Il est chiffré
        (AES) et conservé uniquement le temps de ta session d&apos;onglet.
      </p>
    </motion.form>
  );
}
