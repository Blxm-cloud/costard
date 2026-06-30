import { NextRequest, NextResponse } from "next/server";
import { DiscordApiError, sendChannelEmbed, type EmbedPayload } from "@/lib/discord";

interface Body {
  token?: string;
  channelIds?: string[];
  embed?: EmbedPayload;
  mentionRoleIds?: string[];
}

export async function POST(req: NextRequest) {
  const { token, channelIds, embed, mentionRoleIds = [] } = (await req.json()) as Body;

  if (!token || !channelIds?.length || !embed) {
    return NextResponse.json({ message: "Paramètres manquants." }, { status: 400 });
  }

  const results = await Promise.allSettled(
    channelIds.map((id) => sendChannelEmbed(token, id, embed, mentionRoleIds))
  );

  const successes = results.filter((r) => r.status === "fulfilled").length;
  const failures = results
    .map((r, i) =>
      r.status === "rejected"
        ? {
            channelId: channelIds[i],
            message:
              r.reason instanceof DiscordApiError ? r.reason.message : "Erreur inconnue",
          }
        : null
    )
    .filter(Boolean);

  return NextResponse.json({ successes, total: channelIds.length, failures });
}
