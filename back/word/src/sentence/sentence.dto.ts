import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty } from 'class-validator';

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
