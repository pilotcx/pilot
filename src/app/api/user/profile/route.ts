import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { dbService } from '@/lib/db/service';
import { updateUserSchema } from '@/lib/validations/user';
import { ApiError } from '@/lib/types/errors/api.error';

export const PATCH = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();
  
  const result = updateUserSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  const { email, ...updateData } = result.data;
  
  const updatedUser = await dbService.user.findOneAndUpdate(
    { _id: decoded.id },
    { $set: updateData },
    { new: true }
  );
  
  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }
  
  const { password, ...userWithoutPassword } = updatedUser.toObject();
  return userWithoutPassword;
}, {
  preventDb: false,
  protected: true,
});

export const GET = withApi(async (_request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }
  
  const user = await dbService.user.findById(decoded.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}, {
  preventDb: false,
  protected: true,
}); 