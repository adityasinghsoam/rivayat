import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function registerUser(input: unknown) {
  const data = signupSchema.parse(input);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
    select: {
      email: true,
      username: true,
    },
  });

  if (existingUser?.email === data.email) {
    return {
      ok: false as const,
      status: 409,
      error: "An account with this email already exists.",
    };
  }

  if (existingUser?.username === data.username) {
    return {
      ok: false as const,
      status: 409,
      error: "This username is already taken.",
    };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
  });

  const token = await signAuthToken({
    id: user.id,
    email: user.email,
  });

  await setSessionCookie(token);

  return {
    ok: true as const,
    status: 201,
    token,
    user,
  };
}

export function getRegistrationErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid registration details.";
  }

  if (error instanceof SyntaxError) {
    return "Invalid request body.";
  }

  return "Unable to register user.";
}
