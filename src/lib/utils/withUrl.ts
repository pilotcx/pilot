import {NextRequest} from 'next/server';

export default function withUrl(req: NextRequest) {
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedProto) {
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost';
    return new URL(req.url, `${forwardedProto}://${forwardedHost}`);
  } else {
    return new URL(req.url);
  }
}
