import { NextResponse } from "next/server";
import { logAction } from "@/lib/action-log";
import { getRegistrationErrorMessage, registerUser } from "@/lib/register-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    logAction("user_signup", {
      userId: result.user.id,
    });

    return NextResponse.json({ message: "Registration successful.", token: result.token, user: result.user }, { status: result.status });
  } catch (error) {
    return NextResponse.json({ error: getRegistrationErrorMessage(error) }, { status: 400 });
  }
}
