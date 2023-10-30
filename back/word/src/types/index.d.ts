interface RequestWithUser {
  user: {
    sub: string;
    name: string;
    email: string;
    permissions: Permission;
    iat: string;
    exp: string;
  };
}
