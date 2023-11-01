import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmpty, IsUUID } from 'class-validator';
import { withBaseResponse } from '../utils';
import { Transform } from 'class-transformer';

export class SentenceByIdDTO {
  @IsArray()
  @IsUUID('all', { each: true })
  @Transform((param) => {
    if (Array.isArray(param.value)) {
      return param.value;
    }
    return (param.value as string).split(',');
  })
  @ApiProperty({ type: String })
  ids: string[];
}

export class SentenceDTO {
  @ApiProperty()
  word: string;

  @ApiProperty()
  sentence: string;

  @ApiProperty()
  translation: string;

  @ApiProperty()
  sentence_id: string;
}

export class PaginatedSentenceDTO extends withBaseResponse(SentenceDTO, {
  description: 'List of returned sentences',
}) {}

export class CreateSentenceDto {
  @IsEmpty()
  @ApiProperty({ description: 'Sentence related word ID', required: true })
  word: string;

  @IsEmpty()
  @ApiProperty({ description: 'Sentence in japanese', required: true })
  sentence: string;

  @IsEmpty()
  @ApiProperty({ description: 'Sentence in english', required: true })
  translation: string;
}
export class UpdateSentenceDto {
  @IsEmpty()
  @ApiProperty({ description: 'Sentence related word ID', required: false })
  word?: string;

  @IsEmpty()
  @ApiProperty({ description: 'Sentence in japanese', required: false })
  sentence?: string;

  @IsEmpty()
  @ApiProperty({ description: 'Sentence in english', required: false })
  translation?: string;
}
