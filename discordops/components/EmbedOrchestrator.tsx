"use client";

import { useEffect, useState } from "react";
import { useBotToken } from "@/context/BotTokenContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import type { DiscordChannel } from "@/lib/discord";

const PRESET_COLORS = [
  { label: "Blurple", value: 0x5865f2 },
  { label: "Emerald", value: 0x10b981 },
  { label: "Danger", value: 0xef4444 },
  { label: "Amber", value: 0xf59e0b },
];

export function EmbedOrchestrator() {
  const { token, guilds } = useBotToken();
  const [guildId, setGuildId] = useState(guilds[0]?.id ?? "");
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [imageUrl, setImageUrl] = useState("");
  const [mentionRoleIds, setMentionRoleIds] = useState("");

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!token || !guildId) return;
    setLoadingChannels(true);
    setChannels([]);
    setSelectedChannels([]);
    fetch("/api/discord/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, guildId }),
    })
      .then((r) => r.json())
      .then((data) => setChannels(data.channels ?? []))
      .finally(() => setLoadingChannels(false));
  }, [token, guildId]);

  function toggleChannel(id: string) {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function onSend() {
    if (!token || selectedChannels.length === 0 || !title) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/discord/send-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          channelIds: selectedChannels,
          embed: {
            title,
            description: description || undefined,
            color,
            image: imageUrl ? { url: imageUrl } : undefined,
          },
          mentionRoleIds: mentionRoleIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.failures?.length) {
        setFeedback({
          type: "error",
          text: `${data.successes}/${data.total} envoyé(s). Échecs: ${data.failures
            .map((f: { message: string }) => f.message)
            .join(", ")}`,
        });
      } else {
        setFeedback({ type: "success", text: `Embed envoyé sur ${data.successes} canal/canaux.` });
      }
    } catch {
      setFeedback({ type: "error", text: "Échec réseau lors de l'envoi." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass-panel space-y-5 p-6">
      <h3 className="font-mono text-sm font-semibold text-blurple-light">
        // WEBHOOK & EMBED ORCHESTRATOR
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <select
            value={guildId}
            onChange={(e) => setGuildId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
          >
            {guilds.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'embed"
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de l'image (optionnel)"
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
          />
          <input
            value={mentionRoleIds}
            onChange={(e) => setMentionRoleIds(e.target.value)}
            placeholder="IDs de rôles à mentionner, séparés par des virgules"
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-ink-900 transition"
                style={{
                  backgroundColor: `#${c.value.toString(16).padStart(6, "0")}`,
                  outline: color === c.value ? "2px solid white" : "none",
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400">Canaux cibles</p>
          {loadingChannels ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-white/5 p-2">
              {channels.length === 0 && (
                <p className="p-2 text-xs text-slate-500">Aucun canal texte trouvé.</p>
              )}
              {channels.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-ink-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(c.id)}
                    onChange={() => toggleChannel(c.id)}
                    className="accent-blurple"
                  />
                  # {c.name}
                </label>
              ))}
            </div>
          )}

          {/* Live preview */}
          <div
            className="rounded-md border-l-4 bg-ink-800 p-3"
            style={{ borderLeftColor: `#${color.toString(16).padStart(6, "0")}` }}
          >
            <p className="text-sm font-semibold text-slate-100">{title || "Titre de l'embed"}</p>
            <p className="mt-1 text-xs text-slate-400">
              {description || "La description apparaîtra ici…"}
            </p>
          </div>
        </div>
      </div>

      {feedback && <Alert variant={feedback.type === "success" ? "success" : "error"}>{feedback.text}</Alert>}

      <button
        onClick={onSend}
        disabled={sending || !title || selectedChannels.length === 0}
        className="w-full rounded-lg bg-emerald px-4 py-2.5 font-semibold text-white shadow-glow-emerald transition hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending
          ? "Envoi en cours…"
          : `Envoyer (${selectedChannels.length} canal/canaux)`}
      </button>
    </div>
  );
}
