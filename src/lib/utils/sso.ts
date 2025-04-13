import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import {google} from 'googleapis';

export function verifyGoogleIdToken(idToken: string) {
  const client = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
  });
  return new Promise<any>((resolve, reject) => {
    jwt.verify(idToken, (header, callback) => {
      const kid = header.kid;
      client.getSigningKey(kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      });
    }, {
      algorithms: ['RS256'], // Google signs ID tokens with RS256
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    }, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    });
  });
}

export async function verifyGoogleAuthCode(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `postmessage`,
  );
  const oauth2 = google.oauth2({auth: oauth2Client, version: 'v2'});
  const {tokens} = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);
  return (await oauth2.userinfo.get()).data;
}
