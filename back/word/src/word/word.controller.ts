import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { WordService } from './word.service';
import { CreateWordDto, UpdateWordDefinitionDTO, UpdateWordUUIDDTO, UpdateWordDefinitionTypeDto, UpdateWordReadingDTO } from './word.dto';
import { PaginateWordDTO, WordDTO } from './word.dto';

@Controller('words')
export class WordController {
  constructor(private service: WordService) {}

  @ApiTags('Words')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiBadRequestResponse({ description: 'Query value invalid. Must be a number' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('')
  getAll(@Query('page', new ParseIntPipe()) page?: number, @Query('limit', new ParseIntPipe()) limit?: number) {
    return this.service.findAllPaginate(page, limit);
  }

  @ApiTags('Words')
  @ApiOkResponse({ description: 'Authenticated user profile', type: WordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('/:id')
  getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOneById(id);
  }

  @ApiTags('Words')
  @Post('')
  @ApiCreatedResponse({ description: 'Word created', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  createOne(@Body() body: CreateWordDto) {
    return this.service.create(body);
  }

  @ApiTags('Words')
  @Patch('/:id/word')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addOneWordReading(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateWordReadingDTO) {
    return this.service.addElementToArray(id, body.key, body);
  }

  @ApiTags('Words')
  @Delete('/:id/word')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteOneWordReading(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateWordReadingDTO) {
    return this.service.removeElementToArray(id, body.key, body);
  }

  @Patch('/:id/definition/:index/type')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addOneWordDefinitionType(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordDefinitionTypeDto) {
    const key = `definition.${index}.type`;

    return this.service.addElementToArray(id, key, body);
  }

  @Delete('/:id/definition/:index/type')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteOneWordDefinitionType(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordDefinitionTypeDto) {
    const key = `definition.${index}.type`;

    return this.service.removeElementToArray(id, key, body);
  }

  @Patch('/:id/definition/:index/example')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addOneWordDefinitionExample(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.addDefinitionExample(id, index, body);
  }

  @Delete('/:id/definition/:index/example')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteOneWordDefinitionExample(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.removeDefinitionExample(id, index, body);
  }

  @Patch('/:id/definition/:index/relation')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addOneWordDefinitionrelation(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.addDefinitionRelation(id, index, body);
  }

  @Delete('/:id/definition/:index/relation')
  @ApiTags('Definitions')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteOneWordDefinitionRelation(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.removeDefinitionRelation(id, index, body);
  }

  @ApiTags('Words')
  @Delete('/:id')
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.deleteOneById(id);
  }
}
