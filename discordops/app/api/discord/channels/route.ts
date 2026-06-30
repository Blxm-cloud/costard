import { NextRequest, NextResponse } from "next/server";
import { DiscordApiError, fetchGuildChannels } from "@/lib/discord";

export async function POST(req: NextRequest) {
  const { token, guildId } = (await req.json()) as { token?: string; guildId?: string };

  if (!token || !guildId) {
    return NextResponse.json({ message: "Paramètres manquants." }, { status: 400 });
  }

  try {
    const channels = await fetchGuildChannels(token, guildId);
    return NextResponse.json({ channels });
  } catch (err) {
    if (err instanceof DiscordApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Erreur serveur inattendue." }, { status: 500 });
  }
}
