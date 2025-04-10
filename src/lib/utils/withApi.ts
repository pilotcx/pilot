import {NextRequest, NextResponse} from 'next/server';
import {dbService} from '@/lib/db/service';
import {UserRole} from '@/lib/types/models/user';
import {decode, JWT} from 'next-auth/jwt';

interface WithApiOptions {
  preventDb?: boolean;
  roles?: UserRole[];
  protected?: boolean;
}

export function withApi<T>(
  handler: (request: NextRequest, context: any, decoded?: JWT) => Promise<T> | T,
  options: WithApiOptions = {},
) {
  return async function wrappedHandler(request: NextRequest, context: any): Promise<Response> {
    const {roles = [], preventDb = false, protected: isProtected = false} = options;
    let decoded: JWT | undefined, token: string | undefined;
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.headers.get('Cookie')?.match(/next-auth\.session-token=([^;]+)/)?.[1];

    if (!preventDb) await dbService.connect();

    if (authHeader || cookieToken) {
      token = authHeader?.split('Bearer ')[1] || cookieToken;
      decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!,
      }) ?? undefined;
    }

    try {
      if (isProtected) {
        if (!decoded) {
          return NextResponse.json(
            {data: null, code: 401, message: 'Vui lòng đăng nhập'},
            {status: 401},
          );
        }

        if (roles.length > 0 && !roles.includes(decoded.role as UserRole)) {
          return NextResponse.json(
            {data: null, code: 403, message: 'Không có quyền truy cập nội dung này.'},
            {status: 403},
          );
        }
      }

      const result: any = await handler(request, context, decoded);

      if (result instanceof NextResponse) {
        return result;
      } else {
        if (result?.pagination) {
          result.pagination = {
            ...result.pagination,
            docs: undefined,
          };
        }
        let message = "OK";
        let data = result?.data ?? result;
        let pagination = result?.pagination ?? undefined;
        if (data?.message) {
          message = data?.message;
          delete data?.message;
        }
        return NextResponse.json({
          data,
          pagination,
          code: 200,
          message,
        }, {status: 200});
      }
    } catch (error: any) {
      console.log('error', error);
      const statusCode = error.code ?? error.statusCode ?? 500;
      return NextResponse.json(
        {data: null, code: statusCode, message: error.message || 'Internal Server Error'},
        {status: statusCode},
      );
    }
  };
}
