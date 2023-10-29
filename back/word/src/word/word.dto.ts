import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsDefined, IsEnum, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

import { SentenceResponse } from '../sentence/sentence.entity';
import { withBaseResponse } from '../utils/generics.entity';
import { DefinitionKeyEnum, DefinitionTypeEnum, WordKeyEnum } from '../types/enum';

export class WordShortDTO {
  @ApiProperty()
  word: string[];

  @ApiProperty()
  reading: string[];

  @ApiProperty()
  definition: Array<{
    meaning: string[];
  }>;

  @ApiProperty()
  word_id: string;
}

export class RelationWordDTO {
  @ApiProperty({ nullable: true })
  index: number;

  @ApiProperty({ isArray: true, type: WordShortDTO })
  related_word: WordShortDTO[];
}

export class DefinitionDTO {
  @ApiProperty()
  meaning: string[];

  @ApiProperty()
  type: string[];

  @ApiProperty({ isArray: true, type: SentenceResponse })
  example: SentenceResponse[];

  @ApiProperty({ isArray: true, type: RelationWordDTO })
  relation: RelationWordDTO[];
}

export class WordDTO {
  @ApiProperty()
  word: string[];

  @ApiProperty()
  reading: string[];

  @ApiProperty({ isArray: true, type: DefinitionDTO })
  definition: Array<DefinitionDTO>;

  @ApiProperty()
  word_id: string;
}

export class PaginateWordDTO extends withBaseResponse(WordShortDTO, {
  description: 'List of returned words',
}) {}

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

  @ApiProperty({ description: 'Examples using the words', required: false, type: SentenceResponse, isArray: true })
  example?: SentenceResponse[];
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

export class UpdateWordReadingDTO {
  @IsEnum(WordKeyEnum)
  @IsNotEmpty()
  @ApiProperty({ enum: WordKeyEnum, required: true })
  key: WordKeyEnum;

  @IsNotEmpty()
  @ApiProperty({ required: false, type: String, isArray: true })
  data: string[];
}

export class UpdateWordDefinitionDTO {
  @IsEnum(DefinitionKeyEnum)
  @IsNotEmpty()
  @ApiProperty({ enum: DefinitionKeyEnum, required: true })
  key: DefinitionKeyEnum;

  @IsNotEmpty()
  @ApiProperty({ required: false, type: String, isArray: true })
  data: string[];
}

export class UpdateWordDefinitionTypeDto {
  @IsNotEmpty()
  @ApiProperty({ isArray: true, enum: DefinitionTypeEnum })
  data: DefinitionTypeEnum[];
}
export class UpdateWordUUIDDTO {
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  @ApiProperty({ isArray: true, type: String, description: 'Array of word id' })
  data: string[];
}
