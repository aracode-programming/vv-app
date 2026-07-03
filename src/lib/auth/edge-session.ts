const encoder = new TextEncoder();

async function importAuthKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function createExpectedToken(
  username: string,
  secret: string,
): Promise<string> {
  const key = await importAuthKey(secret);
  const payload = `${username}:${secret}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function verifySessionTokenEdge(
  token: string | undefined,
): Promise<boolean> {
  const username = process.env.AUTH_USERNAME;
  const secret = process.env.AUTH_SECRET;

  if (!token || !username || !secret) {
    return false;
  }

  try {
    const expected = await createExpectedToken(username, secret);
    return timingSafeEqualStrings(token, expected);
  } catch {
    return false;
  }
}
