import axios, {AxiosRequestConfig, Method} from 'axios';
import {ApiResponse} from "@/lib/types/common/api";

export class Api {
  api = axios.create({
    baseURL: `${process.env.PUBLIC_HOST}/api`,
  });

  constructor() {
  }

  private call = async <T>(method: Method, endpoint: string, options?: AxiosRequestConfig, ignoreAuth = false) => {
    const r = await this.api(endpoint, {
      method,
      ...options,
    });
    return r.data as ApiResponse<T>;
  };
}

export default new Api();
