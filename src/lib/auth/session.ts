import { createHmac, timingSafeEqual } from "crypto";

import { SESSION_COOKIE_NAME } from "./constants";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function getAuthUsername(): string {
  const username = process.env.AUTH_USERNAME;
  if (!username) {
    throw new Error("AUTH_USERNAME is not configured");
  }
  return username;
}

export function createSessionToken(): string {
  const payload = `${getAuthUsername()}:${getAuthSecret()}`;
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  try {
    const expected = createSessionToken();
    const tokenBuffer = Buffer.from(token, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (tokenBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new Error("AUTH_USERNAME or AUTH_PASSWORD is not configured");
  }

  const usernameBuffer = Buffer.from(username, "utf8");
  const expectedUsernameBuffer = Buffer.from(expectedUsername, "utf8");
  const passwordBuffer = Buffer.from(password, "utf8");
  const expectedPasswordBuffer = Buffer.from(expectedPassword, "utf8");

  if (
    usernameBuffer.length !== expectedUsernameBuffer.length ||
    passwordBuffer.length !== expectedPasswordBuffer.length
  ) {
    return false;
  }

  return (
    timingSafeEqual(usernameBuffer, expectedUsernameBuffer) &&
    timingSafeEqual(passwordBuffer, expectedPasswordBuffer)
  );
}

export { SESSION_COOKIE_NAME };
