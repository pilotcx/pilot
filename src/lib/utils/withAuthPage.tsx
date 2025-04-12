import {UserRole} from '@/lib/types/models/user';
import {decode} from "next-auth/jwt";
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import dbConnect from "@/lib/db/client";

interface WithAuthOptions {
  roles?: UserRole[];
  redirectTo?: string;
  forbiddenPath?: string;
}

export async function withAuthPage(options: WithAuthOptions = {}) {
  await dbConnect();
  const {roles = [], redirectTo = '/auth/login', forbiddenPath = '/'} = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token')?.value;
  if (!sessionToken) {
    redirect(redirectTo);
  }
  try {
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    if (!decoded || !decoded.role) {
      return redirect(redirectTo);
    } else {
      if (roles.length > 0 && !roles.includes(decoded.role as UserRole)) return redirect(forbiddenPath);
    }
    return decoded;
  } catch (e) {
    redirect(redirectTo);
  }
}
