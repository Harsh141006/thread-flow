// ==========================================
// ThreadFlow — API Auth Helpers
// ==========================================

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * Get the current authenticated session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication for an API route.
 * Returns the session if authenticated, or a 401 response.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Require specific roles for an API route.
 * Returns the session if authorized, or a 403 response.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  if (!allowedRoles.includes(session!.user.role as UserRole)) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}
