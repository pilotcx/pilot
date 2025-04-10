import axios, {AxiosRequestConfig, Method} from 'axios';
import {ApiResponse} from '@client/types/api';
import {BookQueries, Pagination, PostQueries, UserQueries} from "@client/types/app";
import {Book} from "@/lib/types/models/book";
import {filteredParams} from "@client/utils";
import {Category} from "@/lib/types/models/category";
import * as process from "node:process";
import {Publisher} from "@/lib/types/models/publisher";
import {Post} from "@/lib/types/models/post";
import {User} from '@/lib/types/models/user';

export class ApiServerService {
  api = axios.create({
    baseURL: `${process.env.PUBLIC_HOST}/api`,
  });

  constructor() {
  }

  getBooks = async (params?: BookQueries) => {
    try {
      return await this.call<Book[]>('GET', '/books', {params: filteredParams(params)});
    } catch (error: any) {
      console.error('Error fetching books:', error);
      return {
        data: [] as Book[],
        code: error?.response?.status,
        message: error?.code,
        pagination: {} as Pagination
      };
    }
  };

  getPosts = async (params?: PostQueries) => {
    try {
      return await this.call<Post[]>('GET', '/posts', {params: filteredParams(params)});
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      return {
        data: [] as Post[],
        code: error?.response?.status,
        message: error?.code,
        pagination: {} as Pagination
      };
    }
  };

  getBook = async (bookId: string) => {
    try {
      return await this.call<Book>('GET', `/books/${bookId}`);
    } catch (error: any) {
      console.error(`Error fetching category with id ${bookId}:`, error);
      return {
        data: {} as Book,
        code: error?.response?.status,
        message: error?.code,
      };
    }
  };

  getPost = async (postId: string) => {
    try {
      console.log('postId', postId)
      return await this.call<Post>('GET', `/posts/${postId}`);
    } catch (error: any) {
      console.error(`Error fetching category with id ${postId}:`, error);
      return {
        data: {} as Post,
        code: error?.response?.status,
        message: error?.code,
      };
    }
  };

  getCategory = async (categoryId: string) => {
    try {
      return await this.call<Category>('GET', `/categories/${categoryId}`);
    } catch (error: any) {
      console.error(`Error fetching category with id ${categoryId}:`, error);
      return {
        data: {} as Category,
        code: error?.response?.status,
        message: error?.code,
      };
    }
  };

  getPublisher = async (categoryId: string) => {
    try {
      return await this.call<Publisher>('GET', `/publishers/${categoryId}`);
    } catch (error: any) {
      console.error(`Error fetching category with id ${categoryId}:`, error);
      return {
        data: {} as Publisher,
        code: error?.response?.status,
        message: error?.code,
      };
    }
  };

  private call = async <T>(method: Method, endpoint: string, options?: AxiosRequestConfig, ignoreAuth = false) => {
    const r = await this.api(endpoint, {
      method,
      ...options,
    });
    return r.data as ApiResponse<T>;
  };
}

export default new ApiServerService();
