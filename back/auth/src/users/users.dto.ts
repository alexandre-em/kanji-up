import { ApiProperty } from "@nestjs/swagger";

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

  @ApiProperty()
  scores: {
    [key: string]: Date;
  };
}

export class UpdateUserPermissionsDTO {
  @ApiProperty()
  permissions: string | string[];
}
