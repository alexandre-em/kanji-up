import { mixin } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

type Constructor<T = {}> = new (...args: any[]) => T;

export function withBaseResponse<T extends Constructor>(t: T, options?: ApiPropertyOptions) {
  class PaginateResponse<T> {
    @ApiProperty({ isArray: true, type: t, ...options })
    docs: T[];

    @ApiProperty()
    totalDocs: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    pagingCounter: number;

    @ApiProperty()
    hasNextPage: boolean;

    @ApiProperty()
    hasPrevPage: boolean;

    @ApiProperty({ nullable: true })
    prevPage: number;

    @ApiProperty({ nullable: true })
    nextPage: number;
  }

  return mixin(PaginateResponse);
}

export class UpdateArrayDTO {
  @IsNotEmpty()
  @ApiProperty({ isArray: true, type: String })
  data: string[];
}
