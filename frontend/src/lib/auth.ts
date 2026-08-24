// ==========================================
// ThreadFlow — NextAuth Configuration
// ==========================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
          active: true,
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customerId?.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, add user data to the JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.customerId = user.customerId;
      }
      return token;
    },
    async session({ session, token }) {
      // Make user data available in the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.customerId = token.customerId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
