import {BaseRepository} from '@/lib/db/repository';
import {User} from '@/lib/types/models/user';
import dbConnect from '@/lib/db/client';
import {UserSchema} from '@/lib/db/models/user';
import {Schemas} from '@/lib/db/models';

class DBService {
  user: BaseRepository<User>;

  constructor() {
    this.user = new BaseRepository<User>(Schemas.User, UserSchema);
  }

  connect() {
    return dbConnect();
  }
}

export const dbService = new DBService();
