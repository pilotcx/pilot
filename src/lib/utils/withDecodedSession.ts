import {cookies} from 'next/headers';
import {decode} from 'next-auth/jwt';

export default async function withDecodedSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token')?.value;
  if (sessionToken) {
    return await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  }
}
