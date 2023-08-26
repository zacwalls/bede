import type { NextAuthOptions } from 'next-auth'
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@/app/lib/db";

const options: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      } as any),
    ],
    session: {
      strategy: "database"
    },
    callbacks: {
      session: async ({ session, user }) => {
        if (session?.user) {
          session.user.id = user.id;
        }
        return session;
      },
    }
  }

export default options;