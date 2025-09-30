"use client";

import { useEffect } from "react";
import { getAblyClient } from "@/lib/ably";

export function OnlinePresence() {
  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get("online-status");

    const onConnect = () => {
      console.log("Connected as", ably.auth.clientId);
      channel.presence.enter({ status: "online" });
    };

    ably.connection.on("connected", onConnect);

    return () => {
      channel.presence.leave();
      ably.connection.off("connected", onConnect);
    };
  }, []);

  return null;
}
