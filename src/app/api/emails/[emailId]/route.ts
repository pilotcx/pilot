import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Get a specific email
export const GET = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  const email = await emailService.getEmailById(emailId);

  if (!email) {
    throw new ApiError(404, 'Email not found');
  }

  // Mark email as read if it's not from the current user
  if (email.sender.toString() !== decoded.id) {
    await emailService.markEmailAsRead(emailId, decoded.id);
  }

  return {
    data: email,
    message: 'Email retrieved successfully',
  };
}, {
  protected: true,
});

// Update an email
export const PATCH = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  const body = await request.json();
  
  const updatedEmail = await emailService.updateEmail(emailId, decoded.id, body);

  return {
    data: updatedEmail,
    message: 'Email updated successfully',
  };
}, {
  protected: true,
});

// Delete an email
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  
  await emailService.deleteEmail(emailId, decoded.id);

  return {
    data: null,
    message: 'Email deleted successfully',
  };
}, {
  protected: true,
});
