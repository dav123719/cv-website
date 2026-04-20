import { createHash, timingSafeEqual } from "crypto";
import { getServerSession } from "next-auth/next";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: "admin";
    };
  }

  interface User {
    role?: "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin";
  }
}

const DEFAULT_ADMIN_EMAILS = ["ddabbis@gmail.com"];
const DEFAULT_SIGN_IN_PATH = "/sign-in";

function splitEmails(value: string | undefined) {
  const source = value?.trim() || DEFAULT_ADMIN_EMAILS.join(",");
  return new Set(
    source
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function isAllowedAdminEmail(email?: string | null) {
  return splitEmails(process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL).has(
    normalizeEmail(email),
  );
}

function hashSecret(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function verifyPassword(inputPassword: string) {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const expectedRaw = process.env.ADMIN_PASSWORD?.trim();

  if (expectedHash) {
    return hashSecret(inputPassword) === expectedHash.toLowerCase();
  }

  if (expectedRaw) {
    const left = Buffer.from(inputPassword, "utf8");
    const right = Buffer.from(expectedRaw, "utf8");

    if (left.length !== right.length) {
      return false;
    }

    return timingSafeEqual(left, right);
  }

  return false;
}

export const googleAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: DEFAULT_SIGN_IN_PATH,
  },
  providers: [
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ddabbis@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        if (!isAllowedAdminEmail(email) || !verifyPassword(password)) {
          return null;
        }

        return {
          id: email,
          email,
          name: email,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return isAllowedAdminEmail(user.email);
      }

      if (account?.provider === "credentials") {
        return isAllowedAdminEmail(user.email);
      }

      return false;
    },
    async jwt({ token, user }) {
      const email = normalizeEmail(user?.email ?? token.email);

      if (isAllowedAdminEmail(email)) {
        token.role = "admin";
        token.email = email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role === "admin") {
        session.user.role = "admin";
        session.user.email = normalizeEmail(token.email);
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function isAdminSessionEmail(email?: string | null) {
  return isAllowedAdminEmail(email);
}

export async function auth() {
  return getServerSession(authOptions);
}
