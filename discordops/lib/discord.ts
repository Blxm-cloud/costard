// Server-side only helpers for talking to the official Discord REST API.
// Every function here is a thin authenticated proxy: it never persists the
// token, never logs it, and forwards Discord's own error payload back up.

import axios, { AxiosError } from "axios";

const DISCORD_API = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  status: number;
  discordCode?: number;

  constructor(status: number, message: string, discordCode?: number) {
    super(message);
    this.status = status;
    this.discordCode = discordCode;
  }
}

function botHeaders(token: string) {
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

function rethrow(err: unknown): never {
  const ax = err as AxiosError<{ message?: string; code?: number }>;
  if (ax.isAxiosError) {
    const status = ax.response?.status ?? 500;
    const message =
      status === 401
        ? "Token de bot invalide ou révoqué."
        : status === 429
        ? "Rate limit Discord atteint, réessaie dans quelques secondes."
        : ax.response?.data?.message ?? "Erreur inconnue de l'API Discord.";
    throw new DiscordApiError(status, message, ax.response?.data?.code);
  }
  throw err;
}

export interface DiscordBotUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
}

export interface DiscordGuildSummary {
  id: string;
  name: string;
  icon: string | null;
  permissions: string; // bitfield as string (can exceed 32-bit)
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
}

export async function fetchBotUser(token: string): Promise<DiscordBotUser> {
  try {
    const { data } = await axios.get<DiscordBotUser>(`${DISCORD_API}/users/@me`, {
      headers: botHeaders(token),
      timeout: 8000,
    });
    if (!data.bot) {
      throw new DiscordApiError(
        400,
        "Ce token appartient à un compte utilisateur, pas à un bot. DiscordOps n'accepte que les tokens de bot."
      );
    }
    return data;
  } catch (err) {
    if (err instanceof DiscordApiError) throw err;
    rethrow(err);
  }
}

export async function fetchBotGuilds(token: string): Promise<DiscordGuildSummary[]> {
  try {
    const { data } = await axios.get<DiscordGuildSummary[]>(
      `${DISCORD_API}/users/@me/guilds`,
      { headers: botHeaders(token), timeout: 8000 }
    );
    return data;
  } catch (err) {
    rethrow(err);
  }
}

export async function fetchGuildChannels(
  token: string,
  guildId: string
): Promise<DiscordChannel[]> {
  try {
    const { data } = await axios.get<DiscordChannel[]>(
      `${DISCORD_API}/guilds/${guildId}/channels`,
      { headers: botHeaders(token), timeout: 8000 }
    );
    // 0 = GUILD_TEXT, 5 = GUILD_ANNOUNCEMENT
    return data.filter((c) => c.type === 0 || c.type === 5);
  } catch (err) {
    rethrow(err);
  }
}

export interface EmbedPayload {
  title?: string;
  description?: string;
  color?: number;
  image?: { url: string };
}

export async function sendChannelEmbed(
  token: string,
  channelId: string,
  embed: EmbedPayload,
  mentionRoleIds: string[] = []
): Promise<{ id: string }> {
  try {
    const content = mentionRoleIds.map((id) => `<@&${id}>`).join(" ");
    const { data } = await axios.post(
      `${DISCORD_API}/channels/${channelId}/messages`,
      {
        content: content || undefined,
        embeds: [embed],
        allowed_mentions: { roles: mentionRoleIds },
      },
      { headers: botHeaders(token), timeout: 8000 }
    );
    return data;
  } catch (err) {
    rethrow(err);
  }
}

// --- Discord permission bitfield helpers --------------------------------
// Permissions can exceed 32 bits, so everything is computed with BigInt.

export const PERMISSIONS = {
  ADMINISTRATOR: 1n << 3n,
  SEND_MESSAGES: 1n << 11n,
  EMBED_LINKS: 1n << 14n,
} as const;

export function hasPermission(bitfield: string, flag: bigint): boolean {
  return (BigInt(bitfield) & flag) === flag;
}
