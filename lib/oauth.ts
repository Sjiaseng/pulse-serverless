export function randUrlSafe(len = 43) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Buffer.from(bytes).toString("base64url");
}

export async function sha256base64url(input: string) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Buffer.from(hash).toString("base64url");
}

export function cookieOpts() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
  };
}
