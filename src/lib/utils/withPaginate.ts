import {pagination} from '@/lib/validations/pagination';
import {NextRequest} from 'next/server';

export default function withPaginate(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const result = pagination.safeParse(Object.fromEntries(searchParams));
  if (result.error) throw new Error(result.error.message);
  let sort: { [key: string]: 1 | -1 } = {};
  const value = result.data;
  if (value.sort) {
    const [key, direction] = value.sort.split(':');
    if (!key || !direction) throw new Error('Invalid sort');
    sort = {[key]: direction === 'asc' ? 1 : -1};
  }
  const limit = parseInt(result.data.limit as string);
  const page = parseInt(result.data.page as string);
  if (limit < 1 || page < 1) throw new Error('Invalid pagination params');
  return {
    page: page ?? 1,
    limit: limit ?? 10,
    sort: Object.keys(sort).length > 0 ? sort : undefined,
  };
}
