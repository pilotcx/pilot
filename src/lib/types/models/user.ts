export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
  emailVerified?: boolean;
  googleId?: string;
  appleId?: string;
  avatar?: string;
  bio?: string;
}
