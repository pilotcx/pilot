import mongoose, {
  Aggregate,
  AggregatePaginateModel,
  FilterQuery,
  PaginateOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  PaginateModel,
  PipelineStage,
  MongooseBulkWriteOptions,
} from "mongoose";
import mongodb from "mongodb";
export interface MixedModel<T>
  extends PaginateModel<T>,
    AggregatePaginateModel<T> {
  bulkWrite(
    operations: mongoose.AnyBulkWriteOperation<T>[],
    options?: MongooseBulkWriteOptions
  ): Promise<mongodb.BulkWriteResult>;
}

export class BaseRepository<T> {
  private _model: MixedModel<T>;

  constructor(name: string, schema: mongoose.Schema<T>) {
    this._model =
      (mongoose.models[name] as MixedModel<T>) ||
      (mongoose.model<T>(name, schema) as MixedModel<T>);
  }

  create(item: Omit<T, "_id">) {
    return this._model.create(item);
  }

  insertMany(docs: Array<Omit<T, "_id">>) {
    return this._model.insertMany(docs);
  }

  findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ) {
    return this._model.findOne(this.processFilter(filter), projection, options);
  }

  exists(filter: FilterQuery<T>) {
    return this._model.exists(this.processFilter(filter));
  }

  findOneAndUpdate(
    filter: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T>
  ) {
    return this._model.findOneAndUpdate(filter, update, options);
  }

  paginate(filter: FilterQuery<T>, options?: PaginateOptions) {
    return this._model.paginate(this.processFilter(filter), options);
  }

  find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ) {
    return this._model.find(this.processFilter(filter), projection, options);
  }

  aggregate(pipeline?: PipelineStage[]) {
    return this._model.aggregate(pipeline);
  }

  aggregatePaginate(
    query?: mongoose.Aggregate<T[]>,
    options?: PaginateOptions
  ) {
    return this._model.aggregatePaginate(query, options);
  }

  update(
    filter: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T>
  ) {
    return this._model.findOneAndUpdate(
      this.processFilter(filter),
      update,
      options
    );
  }

  updateOne(
    id: string | mongoose.Types.ObjectId,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T>
  ) {
    return this._model.findOneAndUpdate(
      {_id: id},
      update,
      options
    );
  }

  delete(filter?: FilterQuery<T>, options?: QueryOptions<T>) {
    return this._model.findOneAndDelete(this.processFilter(filter || {}), options);
  }

  count(filter?: FilterQuery<T>) {
    return this._model.countDocuments(this.processFilter(filter || {}));
  }

  findById(_id: string) {
    return this._model.findById(_id);
  }

  /**
   * Perform a bulkWrite operation
   * @param operations - Array of operations to perform
   * @param options - Options for the bulkWrite operation
   * @returns Result of the bulkWrite operation
   */
  bulkWrite(
    operations: mongoose.AnyBulkWriteOperation<T>[],
    options?: MongooseBulkWriteOptions
  ): Promise<mongodb.BulkWriteResult> {
    return this._model.bulkWrite(operations, options);
  }

  /**
   * Delete one document that matches the filter
   * @param filter - Filter to match documents
   * @returns Result of the deleteOne operation
   */
  deleteOne(filter: FilterQuery<T>) {
    return this._model.deleteOne(this.processFilter(filter));
  }

  private processFilter(filter: FilterQuery<T>) {
    const processedFilter: any = {};
    for (let key in filter) {
      const value = filter[key];
      if (value !== undefined && value !== null) {
        processedFilter[key] = value;
      }
    }
    return processedFilter as FilterQuery<T>;
  }
}
