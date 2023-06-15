import jwt, { VerifyErrors } from 'jsonwebtoken';
import dotenv from 'dotenv';
import Express from 'express';
import UnauthorizedError from '../error/unauthorized';

dotenv.config();
const SECRET_KEY = process.env.AUTH_API_SECRET_KEY || '';

export async function checkJWT(req: Express.Request, res: Express.Response, next: Express.NextFunction, permissions?: string[]) {
  let token = (req.headers['x-access-token'] || req.headers['authorization']) as string;
  if (!!token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, SECRET_KEY || '', (err: VerifyErrors | null, decoded: DecodedToken) => {
      if (err) {
        return new UnauthorizedError('Authentication token is not valid').sendResponse(res);
      } else {
        req.decoded = decoded;

        if (permissions && permissions.length > 0 && decoded.permissions && decoded.permissions.length > 0) {
          const isAuthorized = permissions.map((p) => decoded.permissions.includes(p)).reduce((prev, curr) => prev && curr, true);

          if (!isAuthorized) {
            const requiredPermissions = permissions.filter((p) => !decoded.permissions.includes(p));
            return new UnauthorizedError('See details on the `require` field').sendPermissionResponse(res, requiredPermissions);
          }
        }

        const info: Partial<DecodedToken> = { ...decoded };
        delete info.iat;
        delete info.exp;

        const expiresIn: number = 24 * 60 * 60;
        const newToken = jwt.sign(info, SECRET_KEY, { expiresIn: expiresIn });

        res.header('Authorization', 'Bearer ' + newToken);
        next();
      }
    });
  } else {
    return new UnauthorizedError('Authentication token is required').sendResponse(res);
  }
}
