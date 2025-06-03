import dbConnect from '@/lib/db/client';
import { Schemas } from '@/lib/db/models';
import { CommentSchema } from '@/lib/db/models/comment';
import { DomainSchema } from '@/lib/db/models/domain';
import { EmailSchema } from '@/lib/db/models/email';
import { EmailAddressSchema } from '@/lib/db/models/email-address';
import { EmailLabelSchema } from '@/lib/db/models/email-label';
import { IntegrationSchema } from '@/lib/db/models/integration';
import { PostSchema } from '@/lib/db/models/post';
import { ProjectSchema } from '@/lib/db/models/project';
import { ProjectMemberSchema } from '@/lib/db/models/project-member';
import { ReactionSchema } from '@/lib/db/models/reaction';
import { SystemConfigSchema } from '@/lib/db/models/system-config';
import { TaskSchema } from '@/lib/db/models/task';
import { TeamSchema } from '@/lib/db/models/team';
import { TeamMemberSchema } from '@/lib/db/models/team-member';
import { TeamRequestSchema } from '@/lib/db/models/team-request';
import { TeamRequestCommentSchema } from '@/lib/db/models/team-request-comment';
import { UserSchema } from '@/lib/db/models/user';
import { BaseRepository } from '@/lib/db/repository';
import { Domain } from '@/lib/types/models/domain';
import { Email, EmailLabel } from '@/lib/types/models/email';
import { EmailAddress } from '@/lib/types/models/email-address';
import { Integration } from '@/lib/types/models/integration';
import { KeyResult, Objective } from '@/lib/types/models/okr';
import { Comment, Post } from '@/lib/types/models/post';
import { Project, ProjectMember } from '@/lib/types/models/project';
import { Reaction } from "@/lib/types/models/reaction";
import { SystemConfig } from '@/lib/types/models/system-config';
import { Task } from '@/lib/types/models/task';
import { Team, TeamMember } from '@/lib/types/models/team';
import { TeamRequest, TeamRequestComment } from '@/lib/types/models/team-request';
import { User } from '@/lib/types/models/user';
import { KeyResultSchema, ObjectiveSchema } from './models/okr';

class DBService {
  user: BaseRepository<User>;
  systemConfig: BaseRepository<SystemConfig>;
  team: BaseRepository<Team>;
  teamMember: BaseRepository<TeamMember>;
  post: BaseRepository<Post>;
  comment: BaseRepository<Comment>;
  reaction: BaseRepository<Reaction>;
  task: BaseRepository<Task>;
  project: BaseRepository<Project>;
  projectMember: BaseRepository<ProjectMember>;
  teamRequest: BaseRepository<TeamRequest>;
  teamRequestComment: BaseRepository<TeamRequestComment>;
  email: BaseRepository<Email>;
  emailLabel: BaseRepository<EmailLabel>;
  integration: BaseRepository<Integration>;
  domain: BaseRepository<Domain>;
  emailAddress: BaseRepository<EmailAddress>;
  objective: BaseRepository<Objective>;
  keyResult: BaseRepository<KeyResult>;

  constructor() {
    this.user = new BaseRepository<User>(Schemas.User, UserSchema);
    this.systemConfig = new BaseRepository<SystemConfig>(Schemas.SystemConfig, SystemConfigSchema);
    this.team = new BaseRepository<Team>(Schemas.Team, TeamSchema);
    this.teamMember = new BaseRepository<TeamMember>(Schemas.TeamMember, TeamMemberSchema);
    this.post = new BaseRepository<Post>(Schemas.Post, PostSchema);
    this.comment = new BaseRepository<Comment>(Schemas.Comment, CommentSchema);
    this.reaction = new BaseRepository<any>(Schemas.Reaction, ReactionSchema);
    this.task = new BaseRepository<Task>(Schemas.Task, TaskSchema);
    this.project = new BaseRepository<Project>(Schemas.Project, ProjectSchema);
    this.projectMember = new BaseRepository<ProjectMember>(Schemas.ProjectMember, ProjectMemberSchema);
    this.teamRequest = new BaseRepository<TeamRequest>(Schemas.TeamRequest, TeamRequestSchema);
    this.teamRequestComment = new BaseRepository<TeamRequestComment>(Schemas.TeamRequestComment, TeamRequestCommentSchema);
    this.email = new BaseRepository<Email>(Schemas.Email, EmailSchema);
    this.emailLabel = new BaseRepository<EmailLabel>(Schemas.EmailLabel, EmailLabelSchema);
    this.integration = new BaseRepository<Integration>(Schemas.Integration, IntegrationSchema);
    this.domain = new BaseRepository<Domain>(Schemas.Domain, DomainSchema);
    this.emailAddress = new BaseRepository<EmailAddress>(Schemas.EmailAddress, EmailAddressSchema);
    this.objective = new BaseRepository<Objective>(Schemas.Objective, ObjectiveSchema);
    this.keyResult = new BaseRepository<KeyResult>(Schemas.KeyResult, KeyResultSchema);
  }

  connect() {
    return dbConnect();
  }
}

export const dbService = new DBService();
