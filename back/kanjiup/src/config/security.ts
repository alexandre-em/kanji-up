import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UnauthorizedError from '../error/unauthorized';

dotenv.config();
const SECRET_KEY = process.env.AUTH_API_SECRET_KEY || '';

export async function checkJWT(req: any, res: any, next: any, permissions?: string[]) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (!!token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, SECRET_KEY || '', (err: any, decoded: any) => {
      if (err) {
        return new UnauthorizedError('Authentication token is not valid').sendResponse(res);
      } else {
        req.decoded = decoded;

        if (permissions && permissions.length > 0
          && decoded.permissions && decoded.permissions.length > 0) {
          const isAuthorized = permissions
            .map((p) => decoded.permissions.includes(p))
            .reduce((prev, curr) => prev && curr, true);

          if (!isAuthorized) {
            const requiredPermissions = permissions.filter((p) => !decoded.permissions.includes(p))
            return new UnauthorizedError('See details on the `require` field').sendPermissionResponse(res, requiredPermissions);
          }
        }

        const info = { ...decoded };
        delete info.iat;
        delete info.exp;

        const expiresIn = 24 * 60 * 60;
        const newToken  = jwt.sign(info, SECRET_KEY, { expiresIn: expiresIn });

        res.header('Authorization', 'Bearer ' + newToken);
        next();
      }
    })
  } else {
    return new UnauthorizedError('Authentication token is required').sendResponse(res);
  }
}
