import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { authService } from '@/lib/services/auth';
import { passwordChangeSchema } from '@/lib/validations/user';
import { ApiError } from '@/lib/types/errors/api.error';

export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();
  
  // Validate the request body against the schema
  const result = passwordChangeSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  // Change the password
  return await authService.changePassword(decoded.id, result.data);
}, {
  preventDb: false,
  protected: true,
}); 