import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { dbService } from '@/lib/db/service';
import { ApiError } from '@/lib/types/errors/api.error';
import { UserRole } from '@/lib/types/models/user';

// Get a specific user
export const GET = withApi(async (request: NextRequest, { params }: { params: { userId: string } }, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can access this resource');
  }

  const userId = params.userId;
  
  // Fetch user
  const user = await dbService.user.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  return {
    data: user,
    message: 'User retrieved successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});

// Update a user
export const PATCH = withApi(async (request: NextRequest, { params }: { params: { userId: string } }, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can update users');
  }

  const userId = params.userId;
  const body = await request.json();
  
  // Prevent changing own role (admin can't demote themselves)
  if (userId === decoded.id && body.role && body.role !== UserRole.Admin) {
    throw new ApiError(400, 'You cannot change your own admin role');
  }
  
  // Update user
  const updatedUser = await dbService.user.findByIdAndUpdate(
    userId,
    { $set: body },
    { new: true }
  );
  
  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }
  
  return {
    data: updatedUser,
    message: 'User updated successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});

// Delete a user
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { userId: string } }, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can delete users');
  }

  const userId = params.userId;
  
  // Prevent deleting self
  if (userId === decoded.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  
  // Delete user
  const deletedUser = await dbService.user.findByIdAndDelete(userId);
  
  if (!deletedUser) {
    throw new ApiError(404, 'User not found');
  }
  
  return {
    data: null,
    message: 'User deleted successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});
