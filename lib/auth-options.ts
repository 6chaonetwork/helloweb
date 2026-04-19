import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin23671361",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;

        if (!username || !password) {
          console.log("[auth] missing credentials");
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: {
            username,
          },
        });

        if (!admin) {
          console.log("[auth] admin not found:", username);
          return null;
        }

        if (admin.status !== "ACTIVE") {
          console.log("[auth] admin disabled:", username);
          return null;
        }

        const valid = await compare(password, admin.passwordHash);

        console.log("[auth] authorize:", {
          username,
          found: true,
          valid,
          role: admin.role,
        });

        if (!valid) {
          return null;
        }

        await prisma.admin.update({
          where: {
            id: admin.id,
          },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: admin.id,
          name: admin.username,
          role: admin.role,
          username: admin.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username || user.name || "";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role =
          token.role === "SUPER_ADMIN" || token.role === "OPERATOR"
            ? token.role
            : "OPERATOR";
        session.user.username =
          typeof token.username === "string"
            ? token.username
            : session.user.name || "";
      }

      return session;
    },
  },
};
