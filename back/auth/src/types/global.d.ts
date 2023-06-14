type DecodedToken = {
  name: string;
  email: string;
  sub: string;
  permissions: string[];
  iat: number;
  exp: number;
};
