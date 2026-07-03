import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyCredentials,
} from "@/lib/auth/session";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "ユーザーIDとパスワードを入力してください。" },
        { status: 400 },
      );
    }

    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { error: "ユーザーIDまたはパスワードが正しくありません。" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: createSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "ログイン処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
