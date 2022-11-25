export class CreateAppDTO {
  name: string;
  platform?: string;
  redirection_url: string;
}

export class UpdateAppDTO {
  name?: string;
  platform?: string;
  redirection_url?: string;
}

export class AuthorizeAppDTO {
  is_autorized: boolean;
}

export class DeleteAppDTO {
  deleted_at: Date;
}
