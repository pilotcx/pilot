import mongoose from "mongoose";

export interface BaseEntity {
  _id?: string | mongoose.Types.ObjectId;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
