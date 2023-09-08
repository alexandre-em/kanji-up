export interface DecodedToken {
  name: string;
  email: string;
  exp: number;
  iat: number;
  permissions: string[];
  sub: string;
}
