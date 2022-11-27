import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  password?: string;
}

export class DeleteUserDTO {
  @ApiProperty()
  deleted_at: Date;
}

export class UpdateUserImageDTO {
  @ApiProperty()
  image: string;
}

export class UpdateUserFriendDTO {
  @ApiProperty()
  user_id: string;
}

export class UpdateUserAppDTO {
  @ApiProperty()
  app_id: string;

  @ApiProperty()
  total_score: number;

  @ApiProperty({ examples: [{ [Date.now().toString()]: 10000 }] })
  scores: {
    [key: string]: number;
  };
}

export class UpdateUserPermissionsDTO {
  @ApiProperty({ examples: ['read:user', '[read:user, write:user]'] })
  permissions: string;
}
