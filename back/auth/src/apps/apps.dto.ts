import { ApiProperty } from '@nestjs/swagger';

export class CreateAppDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  platform?: string;

  @ApiProperty()
  redirection_url: string;
}

export class UpdateAppDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty({ enum: ['web', 'ios', 'android'] })
  platform?: string;

  @ApiProperty()
  redirection_url?: string;
}

export class AuthorizeAppDTO {
  @ApiProperty()
  is_autorized: boolean;
}

export class DeleteAppDTO {
  @ApiProperty()
  deleted_at: Date;
}
