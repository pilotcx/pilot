import { Pagination } from "./pagination";

export interface ApiResponse<T> {
  data: T;
  code: number;
  pagination?: Pagination;
  message: string;
}
