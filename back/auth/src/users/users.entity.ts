import { ApiProperty } from '@nestjs/swagger';

export class UserShortResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  created_at?: string;

  @ApiProperty()
  user_id: string;
}

export class UserDetailResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  friends: Array<Partial<UserShortResponse>>;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ description: 'Value is null by default. And put a value will mean that the user is deleted (soft deleted and remains 7 days before being removed definitively)' })
  deleted_at: string;

  @ApiProperty()
  applications: {
    kanji: Score;
    word: Score;
  };
}

export class UpdatedDataResponse {
  @ApiProperty()
  acknowledged: boolean;

  @ApiProperty()
  modifiedCount: number;

  @ApiProperty()
  upsertedId: string;

  @ApiProperty()
  upsertedCount: number;

  @ApiProperty()
  matchedCount: number;
}
