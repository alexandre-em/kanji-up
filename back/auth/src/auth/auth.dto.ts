export class RegisterDTO {
  name: string;
  password: string;
  email: string;
  created_at: Date;
};

export class LoginDTO {
  email: string;
  password: string;
};
