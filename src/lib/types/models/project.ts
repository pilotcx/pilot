import {BaseEntity} from "@/lib/types/models/base";

export interface Project extends BaseEntity {
  name: string;
  avatar: string;
  description: string;
  code: string;
}
