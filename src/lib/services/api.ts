import axios, {AxiosRequestConfig, Method} from 'axios';
import {ApiResponse} from "@/lib/types/common/api";
import {LoginSchema, RegisterSchema} from "@/lib/validations/auth";
import {AddTeamMemberSchema, CreateTeamSchema, UpdateTeamMemberSchema, UpdateTeamSchema} from "@/lib/validations/team";
import {Team, TeamMember} from "@/lib/types/models/team";
import {User} from '@/lib/types/models/user';
import {UpdateUserSchema} from '@/lib/validations/user';
import {CreatePostInput, Post, ReactionType} from '@/lib/types/models/post';
import {CreateTaskInput, UpdateTaskInput} from '@/lib/validations/task';
import {CreateProjectInput, UpdateProjectInput} from '@/lib/validations/project';
import {Project} from '@/lib/types/models/project';
import {Task} from "@/lib/types/models/task";
import {
  CreateTeamRequestInput,
  TeamRequest,
  TeamRequestComment,
  UpdateTeamRequestInput
} from "@/lib/types/models/team-request";
import {Integration} from "@/lib/types/models/integration";
import {Domain} from "@/lib/types/models/domain";
import {EmailAddress} from "@/lib/types/models/email-address";
import {Email, EmailConversation} from "@/lib/types/models/email";
import { Objective, KeyResult, CreateObjectiveInput, UpdateObjectiveInput, CreateKeyResultInput, UpdateKeyResultInput } from '../types/models/okr';

export class ApiService {
  api = axios.create({
    baseURL: `/api`,
  });

  constructor() {
  }

  private call = async <T>(method: Method, endpoint: string, data?: any, options?: AxiosRequestConfig) => {
    const r = await this.api.request({
      method,
      url: endpoint,
      data,
      ...options,
    });
    return r.data as ApiResponse<T>;
  };

  // Auth methods
  register = async (data: Omit<RegisterSchema, 'confirmPassword' | 'termsAccepted'>) => {
    return this.call('POST', '/auth/register', data);
  };

  login = async (data: LoginSchema) => {
    return this.call('POST', '/auth/login', data);
  };

  logout = async () => {
    return this.call('POST', '/auth/logout');
  };

  // User profile methods
  getUserProfile = async () => {
    return this.call<User>('GET', '/user/profile');
  };

  updateUserProfile = async (data: UpdateUserSchema) => {
    return this.call<User>('PATCH', '/user/profile', data);
  };

  // Team methods
  createTeam = async (data: CreateTeamSchema) => {
    return this.call<Team>('POST', '/teams', data);
  };

  getTeams = async (page = 1, limit = 10) => {
    return this.call<Team[]>('GET', `/teams?page=${page}&limit=${limit}`);
  };

  getTeam = async (teamId: string) => {
    return this.call<Team>('GET', `/teams/${teamId}`);
  };

  getTeamWithMembership = async (slug: string) => {
    return this.call('GET', `/teams/${slug}/with-membership`);
  };

  updateTeam = async (teamId: string, data: UpdateTeamSchema) => {
    return this.call('PUT', `/teams/${teamId}`, data);
  };

  deleteTeam = async (teamId: string) => {
    return this.call('DELETE', `/teams/${teamId}`);
  };

  // Team members methods
  getTeamMembers = async (teamId: string, page = 1, limit = 10) => {
    return this.call<TeamMember[]>('GET', `/teams/${teamId}/members?page=${page}&limit=${limit}`);
  };

  getTeamMember = async (teamId: string, memberId: string) => {
    return this.call<TeamMember>('GET', `/teams/${teamId}/members/${memberId}/get`);
  };

  addTeamMember = async (teamId: string, data: AddTeamMemberSchema) => {
    return this.call('POST', `/teams/${teamId}/members`, data);
  };

  updateTeamMember = async (teamId: string, memberId: string, data: UpdateTeamMemberSchema) => {
    return this.call('PUT', `/teams/${teamId}/members/${memberId}`, data);
  };

  removeTeamMember = async (teamId: string, memberId: string) => {
    return this.call('DELETE', `/teams/${teamId}/members/${memberId}`);
  };

  // User teams
  getUserTeams = async (page = 1, limit = 10) => {
    return this.call('GET', `/user/teams?page=${page}&limit=${limit}`);
  };

  // Team requests methods
  getTeamRequests = async (teamId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    requesterId?: string;
  } = {}) => {
    const {page = 1, limit = 10, status, requesterId} = options;
    let url = `/teams/${teamId}/requests?page=${page}&limit=${limit}`;

    if (status) url += `&status=${status}`;
    if (requesterId) url += `&requesterId=${requesterId}`;

    return this.call<TeamRequest[]>('GET', url);
  };

  createTeamRequest = async (teamId: string, data: CreateTeamRequestInput) => {
    return this.call<TeamRequest>('POST', `/teams/${teamId}/requests`, data);
  };

  getTeamRequest = async (teamId: string, requestId: string) => {
    return this.call<TeamRequest>('GET', `/teams/${teamId}/requests/${requestId}`);
  };

  updateTeamRequest = async (teamId: string, requestId: string, data: UpdateTeamRequestInput) => {
    return this.call<TeamRequest>('PUT', `/teams/${teamId}/requests/${requestId}`, data);
  };

  deleteTeamRequest = async (teamId: string, requestId: string) => {
    return this.call('DELETE', `/teams/${teamId}/requests/${requestId}`);
  };

  // Team request comments methods
  getTeamRequestComments = async (teamId: string, requestId: string, page = 1, limit = 10) => {
    return this.call<TeamRequestComment[]>('GET', `/teams/${teamId}/requests/${requestId}/comments?page=${page}&limit=${limit}`);
  };

  addTeamRequestComment = async (teamId: string, requestId: string, content: string) => {
    return this.call<TeamRequestComment>('POST', `/teams/${teamId}/requests/${requestId}/comments`, {content});
  };

  // Post methods
  getTeamPosts = async (teamId: string, options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    const {limit = 10, skip = 0, sortBy = 'createdAt', sortOrder = 'desc'} = options;
    return this.call<Post[]>(
      'GET',
      `/teams/${teamId}/posts?limit=${limit}&skip=${skip}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
  };

  createPost = async (teamId: string, data: CreatePostInput) => {
    return this.call<Post>('POST', `/teams/${teamId}/posts`, data);
  };

  getPost = async (postId: string) => {
    return this.call<Post>('GET', `/posts/${postId}`);
  };

  deletePost = async (postId: string) => {
    return this.call('DELETE', `/posts/${postId}`);
  };

  reactToPost = async (postId: string, type: ReactionType) => {
    return this.call('POST', `/posts/${postId}/reactions`, {type});
  };

  commentOnPost = async (teamId: string, postId: string, content: string, parentId?: string) => {
    return this.call('POST', `/teams/${teamId}/posts/${postId}/comments`, {content, parentId});
  };

  getPostComments = async (teamId: string, postId: string, options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    const {limit = 10, skip = 0, sortBy = 'createdAt', sortOrder = 'desc'} = options;
    return this.call('GET',
      `/teams/${teamId}/posts/${postId}/comments?limit=${limit}&skip=${skip}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
  };

  getCommentReplies = async (teamId: string, commentId: string, options: {
    limit?: number;
    skip?: number;
  } = {}) => {
    const {limit = 10, skip = 0} = options;
    return this.call('GET', `/teams/${teamId}/comments/${commentId}/replies?limit=${limit}&skip=${skip}`);
  };

  deleteComment = async (teamId: string, commentId: string) => {
    return this.call('DELETE', `/teams/${teamId}/comments/${commentId}`);
  };

  // Task methods
  getTeamTasks = async (teamId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    priority?: number;
    assignee?: string;
    project?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignee,
      project
    } = options;

    let url = `/teams/${teamId}/tasks?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (assignee) url += `&assignee=${assignee}`;
    if (project) url += `&project=${project}`;

    return this.call<Task[]>('GET', url);
  };

  getUserTeamTasks = async (teamId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    priority?: number;
    assignee?: string;
    project?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignee,
      project
    } = options;

    let url = `/teams/${teamId}/user-tasks?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (assignee) url += `&assignee=${assignee}`;
    if (project) url += `&project=${project}`;

    return this.call<Task[]>('GET', url);
  };

  createTask = async (teamId: string, data: CreateTaskInput) => {
    return this.call<Task>('POST', `/teams/${teamId}/projects/${data.project}/tasks`, data);
  };

  createProjectTask = async (teamId: string, projectCode: string, data: CreateTaskInput) => {
    return this.call<Task>('POST', `/teams/${teamId}/projects/${projectCode}/tasks`, data);
  };

  getTask = async (teamId: string, taskId: string) => {
    return this.call<Task>('GET', `/teams/${teamId}/tasks/${taskId}`);
  };

  updateTask = async (teamId: string, taskId: string, data: UpdateTaskInput) => {
    return this.call<Task>('PUT', `/teams/${teamId}/tasks/${taskId}`, data);
  };

  deleteTask = async (taskId: string) => {
    return this.call('DELETE', `/tasks/${taskId}`);
  };

  getProjectTasks = async (teamId: string, projectId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    priority?: number;
    assignee?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignee
    } = options;

    let url = `/teams/${teamId}/projects/${projectId}/tasks?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (assignee) url += `&assignee=${assignee}`;

    return this.call<Task[]>('GET', url);
  };

  // Project methods
  getTeamProjects = async (teamId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    const {page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'} = options;
    return this.call<Project[]>(
      'GET',
      `/teams/${teamId}/projects?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
  };

  createProject = async (teamId: string, data: CreateProjectInput) => {
    return this.call<Project>('POST', `/teams/${teamId}/projects`, data);
  };

  getProject = async (projectId: string) => {
    return this.call<Project>('GET', `/projects/${projectId}`);
  };

  getProjectByCode = async (teamId: string, projectCode: string) => {
    return this.call<Project>('GET', `/teams/${teamId}/projects/code/${projectCode}`);
  };

  updateProject = async (projectId: string, data: UpdateProjectInput) => {
    return this.call<Project>('PUT', `/projects/${projectId}`, data);
  };

  deleteProject = async (projectId: string) => {
    return this.call('DELETE', `/projects/${projectId}`);
  };

  // Integration methods
  getTeamIntegrations = async (teamId: string) => {
    return this.call<Integration[]>('GET', `/teams/${teamId}/integrations`);
  };

  getMailgunIntegration = async (teamId: string) => {
    return this.call('GET', `/teams/${teamId}/integrations/mailgun`);
  };

  createOrUpdateMailgunIntegration = async (teamId: string, data: any) => {
    return this.call('POST', `/teams/${teamId}/integrations/mailgun`, data);
  };

  deleteMailgunIntegration = async (teamId: string) => {
    return this.call('DELETE', `/teams/${teamId}/integrations/mailgun`);
  };

  // Domain methods
  getTeamDomains = async (teamId: string) => {
    return this.call<Domain[]>('GET', `/teams/${teamId}/domains`);
  };

  createDomain = async (teamId: string, data: any) => {
    return this.call('POST', `/teams/${teamId}/domains`, data);
  };

  getDomainById = async (teamId: string, domainId: string) => {
    return this.call('GET', `/teams/${teamId}/domains/${domainId}`);
  };

  updateDomain = async (teamId: string, domainId: string, data: any) => {
    return this.call('PATCH', `/teams/${teamId}/domains/${domainId}`, data);
  };

  deleteDomain = async (teamId: string, domainId: string) => {
    return this.call('DELETE', `/teams/${teamId}/domains/${domainId}`);
  };

  // Verify Mailgun API key and fetch domains
  verifyMailgunApiKey = async (apiKey: string) => {
    return this.call<any>('POST', '/integrations/mailgun/verify', {apiKey});
  };

  // Email address methods for team members
  getMemberEmailAddresses = async (teamId: string, memberId: string) => {
    return this.call<EmailAddress[]>('GET', `/teams/${teamId}/members/${memberId}/email-addresses`);
  };

  getMemberEmailAddressById = async (teamId: string, memberId: string, emailAddressId: string) => {
    return this.call('GET', `/teams/${teamId}/members/${memberId}/email-addresses/${emailAddressId}`);
  };

  createMemberEmailAddress = async (teamId: string, memberId: string, data: any) => {
    return this.call('POST', `/teams/${teamId}/members/${memberId}/email-addresses`, data);
  };

  updateMemberEmailAddress = async (teamId: string, memberId: string, emailAddressId: string, data: any) => {
    return this.call('PATCH', `/teams/${teamId}/members/${memberId}/email-addresses/${emailAddressId}`, data);
  };

  deleteMemberEmailAddress = async (teamId: string, memberId: string, emailAddressId: string) => {
    return this.call('DELETE', `/teams/${teamId}/members/${memberId}/email-addresses/${emailAddressId}`);
  };

  sendEmail = (teamId: string, emailData: FormData) => {
    return this.call('POST', `/teams/${teamId}/mailing/send`, emailData);
  }

  getConversationsWithLatestEmail = async (teamId: string, memberId: string, options: {
    page?: number;
    limit?: number;
    labelId?: string;
    search?: string;
    isStarred?: boolean;
    isRead?: boolean;
    status?: string;
    emailAddress?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      labelId,
      search,
      isStarred,
      isRead,
      status,
      emailAddress
    } = options;

    let url = `/teams/${teamId}/members/${memberId}/conversations?page=${page}&limit=${limit}`;

    if (labelId) url += `&labelId=${labelId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (isStarred !== undefined) url += `&isStarred=${isStarred}`;
    if (isRead !== undefined) url += `&isRead=${isRead}`;
    if (status) url += `&status=${status}`;
    if (emailAddress) url += `&emailAddress=${encodeURIComponent(emailAddress)}`;

    return this.call<{
      conversation: EmailConversation,
      email: Email,
    }[]>('GET', url);
  };

  getConversationEmails = async (teamId: string, conversationId: string, emailAddress: string) => {
    return this.call<Email[]>('GET', `/teams/${teamId}/mailing/${conversationId}/emails`, undefined, {
      params: {
        emailAddress,
      }
    });
  };

  // OKR methods
  getTeamObjectives = async (teamId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    dueDate?: Date;
    ownerId?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 10,
      status,
      dueDate,
      ownerId
    } = options;

    let url = `/teams/${teamId}/okr?page=${page}&limit=${limit}`;

    if (status) url += `&status=${status}`;
    if (dueDate) url += `&dueDate=${dueDate.toISOString()}`;
    if (ownerId) url += `&ownerId=${ownerId}`;

    return this.call<Objective[]>('GET', url);
  };

  createObjective = async (teamId: string, data: CreateObjectiveInput) => {
    return this.call<Objective>('POST', `/teams/${teamId}/okr`, data);
  };

  getObjective = async (objectiveId: string) => {
    return this.call<Objective>('GET', `/okr/${objectiveId}`);
  };

  updateObjective = async (objectiveId: string, data: UpdateObjectiveInput) => {
    return this.call<Objective>('PUT', `/okr/${objectiveId}`, data);
  };

  deleteObjective = async (objectiveId: string) => {
    return this.call('DELETE', `/okr/${objectiveId}`);
  };

  // Key Results methods
  getObjectiveKeyResults = async (objectiveId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    ownerId?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 10,
      status,
      ownerId
    } = options;

    let url = `/okr/${objectiveId}/key-results?page=${page}&limit=${limit}`;

    if (status) url += `&status=${status}`;
    if (ownerId) url += `&ownerId=${ownerId}`;

    return this.call<KeyResult[]>('GET', url);
  };

  createKeyResult = async (objectiveId: string, data: CreateKeyResultInput) => {
    return this.call<KeyResult>('POST', `/okr/${objectiveId}/key-results`, data);
  };

  getKeyResult = async (keyResultId: string) => {
    return this.call<KeyResult>('GET', `/key-results/${keyResultId}`);
  };

  updateKeyResult = async (keyResultId: string, data: UpdateKeyResultInput) => {
    return this.call<KeyResult>('PUT', `/key-results/${keyResultId}`, data);
  };

  deleteKeyResult = async (keyResultId: string) => {
    return this.call('DELETE', `/key-results/${keyResultId}`);
  };

  // OKR Statistics
  getTeamOkrStatistics = async (teamId: string) => {
    return this.call<{
      totalObjectives: number;
      completedObjectives: number;
      inProgressObjectives: number;
      atRiskObjectives: number;
      totalKeyResults: number;
      completedKeyResults: number;
      averageProgress: number;
      statusCounts: Record<string, number>;
    }>('GET', `/teams/${teamId}/okr/statistics`);
  };
}

const apiService = new ApiService();

export default apiService;
