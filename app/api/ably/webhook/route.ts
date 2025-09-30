import { NextRequest, NextResponse } from "next/server";
import { usersRepository } from "@/lib/db/repositories/userRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[Ably Webhook]", JSON.stringify(body, null, 2));

    if (body.source === "channel.presence" && Array.isArray(body.presence)) {
      for (const presenceEvent of body.presence) {
        const clientId = presenceEvent.clientId as string;
        const action = presenceEvent.action; // number

        if (!clientId) continue;

        if (action === 2) {
          await usersRepository.setOnline(clientId);
          console.log(`[DB] Set ${clientId} online=true`);
        } else if (action === 3) {
          await usersRepository.setOffline(clientId);
          console.log(`[DB] Set ${clientId} online=false`);
        } else if (action === 4) {
          await usersRepository.setOnline(clientId);
          console.log(`[DB] Refreshed ${clientId} online=true`);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook Error]", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
