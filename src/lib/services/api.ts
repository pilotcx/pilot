import axios, {AxiosRequestConfig, Method} from 'axios';
import {ApiResponse} from "@/lib/types/common/api";
import {LoginSchema, RegisterSchema} from "@/lib/validations/auth";
import {AddTeamMemberSchema, CreateTeamSchema, UpdateTeamMemberSchema, UpdateTeamSchema} from "@/lib/validations/team";
import {Team, TeamMember} from "@/lib/types/models/team";
import {User} from '@/lib/types/models/user';
import {UpdateUserSchema} from '@/lib/validations/user';
import {CreatePostInput, Post, ReactionType} from '@/lib/types/models/post';

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
}

const apiService = new ApiService();

export default apiService;
