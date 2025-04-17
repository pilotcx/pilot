import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Update a label
export const PATCH = withApi(async (request: NextRequest, { params }: { params: { labelId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const labelId = params.labelId;
  const body = await request.json();
  
  const updatedLabel = await emailService.updateLabel(labelId, decoded.id, body);

  return {
    data: updatedLabel,
    message: 'Label updated successfully',
  };
}, {
  protected: true,
});

// Delete a label
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { labelId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const labelId = params.labelId;
  
  await emailService.deleteLabel(labelId, decoded.id);

  return {
    data: null,
    message: 'Label deleted successfully',
  };
}, {
  protected: true,
});
