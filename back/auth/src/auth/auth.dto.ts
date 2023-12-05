export class RegisterDTO {
  name: string;
  password: string;
  email: string;
  created_at: Date;
  expireAt: Date | null;
}

export class LoginDTO {
  email: string;
  password: string;
}
