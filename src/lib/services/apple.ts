import jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import {ApiError} from "@/lib/types/errors/api.error";

class AppleAuthService {
  private readonly appleKeysUrl = 'https://appleid.apple.com/auth/keys';
  private client = jwksClient({
    jwksUri: this.appleKeysUrl,
  });

  private async getAppleSignKey(kid: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }

  async validateAppleToken(idToken: string): Promise<any> {
    const decodedHeader = jwt.decode(idToken, {complete: true});
    if (!decodedHeader) {
      throw new ApiError(400, 'Invalid token');
    }

    const {kid} = decodedHeader.header;

    const publicKey = await this.getAppleSignKey(kid);
    if (!publicKey) {
      throw new ApiError(400, 'Invalid token');
    }

    try {
      const decodedToken = jwt.verify(idToken, publicKey, {algorithms: ['RS256']});

      const {iss, aud, exp} = decodedToken as any;

      if (iss !== 'https://appleid.apple.com') {
        throw new ApiError(400, 'Invalid issuer');
      }

      if (aud !== process.env.NEXT_PUBLIC_APPLE_CLIENT_ID) {
        throw new ApiError(400, 'Invalid audience');
      }

      if (Date.now() / 1000 > exp) {
        throw new ApiError(400, 'Token has expired');
      }

      // If all validations pass, return the decoded token
      return decodedToken;

    } catch (err) {
      throw new ApiError(400, 'Token verification failed');
    }
  }
}

export const appleAuthService = new AppleAuthService();
