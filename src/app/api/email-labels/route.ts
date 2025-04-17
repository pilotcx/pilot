import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Get all labels for the authenticated user
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const labels = await emailService.getUserLabels(decoded.id);

  return {
    data: labels,
    message: 'Labels retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new label
export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();
  
  // Set the user to the authenticated user
  body.user = decoded.id;
  body.isSystem = false; // Ensure user can't create system labels
  
  const label = await emailService.createLabel(body);

  return {
    data: label,
    message: 'Label created successfully',
  };
}, {
  protected: true,
});
