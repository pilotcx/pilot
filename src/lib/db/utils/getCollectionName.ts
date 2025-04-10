import {Schemas} from '@/lib/db/models';
import pluralize from "pluralize";

export function getCollectionName(schemaName: Schemas): string {
  return pluralize(schemaName.toLowerCase())
}
