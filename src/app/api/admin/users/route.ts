import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { dbService } from '@/lib/db/service';
import { ApiError } from '@/lib/types/errors/api.error';
import { UserRole } from '@/lib/types/models/user';
import { authService } from '@/lib/services/auth';
import withUrl from '@/lib/utils/withUrl';

// Get users with pagination and filtering
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can access this resource');
  }

  const url = withUrl(request);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const role = url.searchParams.get('role') || '';

  // Build query
  const query: any = {};

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') {
    query.role = role;
  }

  // Fetch users with pagination
  const users = await dbService.user.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    lean: true,
  });

  return {
    data: users,
    message: 'Users retrieved successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});

// Create a new user
export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can create users');
  }

  const body = await request.json();

  try {
    // Register the user
    const user = await authService.register({
      ...body,
      role: body.role || UserRole.User,
    });

    return {
      data: user,
      message: 'User created successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to create user');
  }
}, {
  protected: true,
  roles: [UserRole.Admin],
});
