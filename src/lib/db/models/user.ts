import mongoose from 'mongoose';
import {User, UserRole} from '@/lib/types/models/user';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';

export const UserSchema = new mongoose.Schema<User>({
  fullName: String,
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  phoneNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.Reader,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  googleId: String,
  appleId: String,
  avatar: String,
});

UserSchema.plugin(mongooseAggregatePaginate);
UserSchema.plugin(mongoosePaginate);
