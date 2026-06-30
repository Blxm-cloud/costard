import { NextRequest, NextResponse } from "next/server";
import { DiscordApiError, fetchBotGuilds, fetchBotUser } from "@/lib/discord";

// Ephemeral proxy: receives the token in the request body over HTTPS,
// forwards it once to Discord, returns the result, and forgets it.
// Nothing here writes the token to disk, a database, or a log line.
export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token?: string };

  if (!token || typeof token !== "string" || token.length < 20) {
    return NextResponse.json({ message: "Token manquant ou mal formé." }, { status: 400 });
  }

  try {
    const bot = await fetchBotUser(token);
    const guilds = await fetchBotGuilds(token);
    return NextResponse.json({ bot, guilds });
  } catch (err) {
    if (err instanceof DiscordApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Erreur serveur inattendue." }, { status: 500 });
  }
}
