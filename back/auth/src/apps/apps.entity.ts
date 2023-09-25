import { ApiProperty } from '@nestjs/swagger';

export class AppResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  redirection_url: string;

  @ApiProperty()
  platform: 'web' | 'native';

  @ApiProperty()
  created_by: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  deleted_at: null | string;

  @ApiProperty()
  is_autorized: boolean;

  @ApiProperty()
  app_id: string;
}
