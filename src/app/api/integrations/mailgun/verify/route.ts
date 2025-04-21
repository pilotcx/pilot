import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { mailgunService } from '@/lib/services/mailgun';
import { ApiError } from '@/lib/types/errors/api.error';
import { z } from 'zod';

// Validation schema for API key
const verifyApiKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

// Verify Mailgun API key and fetch domains
export const POST = withApi(async (request: NextRequest) => {
  // Parse and validate request body
  const body = await request.json();
  const result = verifyApiKeySchema.safeParse(body);
  
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  const { apiKey } = result.data;
  
  // Validate the API key and get domains
  const { valid, domains } = await mailgunService.validateMailgunCredentials(apiKey);
  
  if (!valid) {
    return {
      data: { valid: false, domains: [] },
      message: 'Invalid Mailgun API key',
      success: false,
    };
  }
  
  return {
    data: { 
      valid: true, 
      domains: domains.map((domain: any) => ({
        id: domain.id,
        name: domain.name,
        state: domain.state,
        created_at: domain.created_at,
        is_disabled: domain.is_disabled || false,
      }))
    },
    message: 'Mailgun API key verified successfully',
    success: true,
  };
}, {
  protected: true,
});
