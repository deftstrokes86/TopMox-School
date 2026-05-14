import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/validations/auth.schema";

import { isDemoLoginEnabled } from "./demo-login";
import { isScryptPasswordHash, verifyPassword } from "./password";
import { getDashboardPathForRole } from "./role";
import { isAppRole, type AppRole } from "./types";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "TopMox Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.trim().toLowerCase();
        const { db } = await import("@/lib/db");
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true
          }
        });

        if (!user || !user.passwordHash || !isAppRole(user.role)) {
          return null;
        }

        const usesLegacyDemoHash = !isScryptPasswordHash(user.passwordHash);
        // Demo-only protection: legacy plain demo hashes should never authenticate in production unless explicitly enabled.
        if (
          usesLegacyDemoHash &&
          !isDemoLoginEnabled() &&
          process.env.NODE_ENV !== "test"
        ) {
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const nextRole = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = isAppRole(nextRole) ? nextRole : undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const role: AppRole | null = isAppRole(token.role) ? token.role : null;
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.email = typeof token.email === "string" ? token.email : "";
        session.user.name = typeof token.name === "string" ? token.name : "";
        session.user.role = role;
        session.dashboardPath = getDashboardPathForRole(role);
      }

      return session;
    }
  }
};
