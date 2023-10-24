import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsDefined, ValidateNested } from 'class-validator';
import { Sentence } from '../sentence/sentence.schema';

export class WordDefinitionDto {
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @ApiProperty({ description: 'English translation' })
  meaning: string[];

  @ApiProperty({ description: 'More context, precision of the word', required: false })
  description?: string;

  @ApiProperty({ description: 'adv, n, pn, etc.', required: false })
  type?: string[];

  @ApiProperty({ description: 'Word related to the current word', required: false })
  related_word?: string[];

  @ApiProperty({ description: 'Examples using the words', required: false })
  example?: Sentence[];
}

export class CreateWordDto {
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ description: 'Array of words having the same meaning and usages', required: false })
  word?: string[];

  @IsDefined()
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @ApiProperty({ description: 'Readings of the words in hiragana', required: true })
  reading: string[];

  @ValidateNested({ each: true })
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @Type(() => WordDefinitionDto)
  @ApiProperty({ description: 'English translation with word type and some examples', type: [WordDefinitionDto] })
  definition?: WordDefinitionDto[];
}
export class UpdateWordDto {
  @ApiProperty({ required: false })
  word?: string[];

  @ApiProperty({ required: false })
  reading?: string[];

  @ApiProperty({ required: false })
  type?: string[];

  @ValidateNested({ each: true })
  @Type(() => WordDefinitionDto)
  @ApiProperty({ description: 'English translation with word type and some examples', required: false, type: [WordDefinitionDto] })
  definition?: WordDefinitionDto[];
}
