import {User as AppUser} from '@/lib/types/models/user';

declare module "next-auth" {
  interface Session {
    user: AppUser;
    issuer: "default" | "mobile";
  }
}
declare module "next-auth/jwt" {
  export interface JWT {
    id: string;
    role: UserRole;
    fullName: string;
    avatar: string;
    phoneNumber: string;
  }
}
