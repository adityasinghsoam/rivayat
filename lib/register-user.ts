import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function registerUser(input: unknown) {
  const data = signupSchema.parse(input);

  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    }),
  ]);

  if (existingEmailUser) {
    return {
      ok: false as const,
      status: 409,
      error: "An account with this email already exists.",
    };
  }

  if (existingUsernameUser) {
    return {
      ok: false as const,
      status: 409,
      error: "This username is already taken.",
    };
  }

  const passwordHash = await hashPassword(data.password);

  let user;

  try {
    user = await prisma.user.create({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false as const,
        status: 409,
        error: "Email or username is already in use.",
      };
    }

    throw error;
  }

  const token = await signAuthToken({
    id: user.id,
    email: user.email,
  });

  try {
    await setSessionCookie(token);
  } catch {
    // Returning the token is enough for the frontend auth flow.
  }

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

  if (error instanceof Error) {
    return error.message || "Unable to register user.";
  }

  return "Unable to register user.";
}
