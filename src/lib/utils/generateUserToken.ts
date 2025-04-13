import {User} from '@/lib/types/models/user';
import {encode} from 'next-auth/jwt';

export default function generateUserToken(user: User) {
  return encode({
    secret: process.env.NEXTAUTH_SECRET!,
    token: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      phoneNumber: user.phoneNumber || '',
    },
  });
}
