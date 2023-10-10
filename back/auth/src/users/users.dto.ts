import { ApiProperty } from '@nestjs/swagger';
import Permission from '../utils/permission.type';

export class UpdateUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  password?: string;
}

export class DeleteUserDTO {
  @ApiProperty()
  deleted_at: Date;

  @ApiProperty()
  expireAt: Date;
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
  total_score: number;

  @ApiProperty({ examples: [{ [Date.now().toString()]: 10000 }] })
  scores: {
    [timestamp: string]: number;
  };

  @ApiProperty({ examples: [{ 愛: 30 }] })
  progression: {
    [key: string]: number;
  };
}

export class UpdateUserPermissionsDTO {
  @ApiProperty({ examples: ['read:user', '[read:user, write:user]'] })
  permissions: Permission;
}
