import {BaseRepository} from '@/lib/db/repository';
import {User} from '@/lib/types/models/user';
import {SystemConfig} from '@/lib/types/models/system-config';
import {Team} from '@/lib/types/models/team';
import {TeamMember} from '@/lib/types/models/team';
import {Post, Comment} from '@/lib/types/models/post';
import dbConnect from '@/lib/db/client';
import {UserSchema} from '@/lib/db/models/user';
import {SystemConfigSchema} from '@/lib/db/models/system-config';
import {TeamSchema} from '@/lib/db/models/team';
import {TeamMemberSchema} from '@/lib/db/models/team-member';
import {PostSchema} from '@/lib/db/models/post';
import {CommentSchema} from '@/lib/db/models/comment';
import {Schemas} from '@/lib/db/models';

class DBService {
  user: BaseRepository<User>;
  systemConfig: BaseRepository<SystemConfig>;
  team: BaseRepository<Team>;
  teamMember: BaseRepository<TeamMember>;
  post: BaseRepository<Post>;
  comment: BaseRepository<Comment>;

  constructor() {
    this.user = new BaseRepository<User>(Schemas.User, UserSchema);
    this.systemConfig = new BaseRepository<SystemConfig>(Schemas.SystemConfig, SystemConfigSchema);
    this.team = new BaseRepository<Team>(Schemas.Team, TeamSchema);
    this.teamMember = new BaseRepository<TeamMember>(Schemas.TeamMember, TeamMemberSchema);
    this.post = new BaseRepository<Post>(Schemas.Post, PostSchema);
    this.comment = new BaseRepository<Comment>(Schemas.Comment, CommentSchema);
  }

  connect() {
    return dbConnect();
  }
}

export const dbService = new DBService();
