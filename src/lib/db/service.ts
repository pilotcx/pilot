import {BaseRepository} from '@/lib/db/repository';
import {User} from '@/lib/types/models/user';
import {SystemConfig} from '@/lib/types/models/system-config';
import dbConnect from '@/lib/db/client';
import {UserSchema} from '@/lib/db/models/user';
import {SystemConfigSchema} from '@/lib/db/models/system-config';
import {Schemas} from '@/lib/db/models';

class DBService {
  user: BaseRepository<User>;
  systemConfig: BaseRepository<SystemConfig>;

  constructor() {
    this.user = new BaseRepository<User>(Schemas.User, UserSchema);
    this.systemConfig = new BaseRepository<SystemConfig>(Schemas.SystemConfig, SystemConfigSchema);
  }

  connect() {
    return dbConnect();
  }
}

export const dbService = new DBService();
