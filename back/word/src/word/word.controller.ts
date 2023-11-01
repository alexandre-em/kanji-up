import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { WordService } from './word.service';
import { CreateWordDto, UpdateWordUUIDDTO, UpdateWordDefinitionTypeDto, UpdateWordReadingDTO } from './word.dto';
import { PaginateWordDTO, WordDTO } from './word.dto';
import PermissionGuard from '../security/permission.guard';
import permissions from '../utils/permission.type';

@Controller('words')
export class WordController {
  constructor(private service: WordService) {}

  @ApiTags('Words')
  @ApiOperation({ summary: 'Get a paginated list of words' })
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiBadRequestResponse({ description: 'Query value invalid. Must be a number' })
  @Get('')
  getAll(@Query('page', new ParseIntPipe()) page?: number, @Query('limit', new ParseIntPipe()) limit?: number) {
    return this.service.findAllPaginate(page, limit);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Get details of words' })
  @ApiOkResponse({ description: 'Word details', type: WordDTO })
  @Get('/:id')
  getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOneById(id);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Search word' })
  @ApiOkResponse({ description: 'List of words', type: PaginateWordDTO })
  @ApiBadRequestResponse({ description: 'Query value invalid. Must be a number' })
  @Get('/search/word')
  searchWord(@Query('query') query: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.searchWord(query, page, limit);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Create a word', description: '**Permission required:** \n- `add:word`' })
  @Post('')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.ADD_WORD]))
  @ApiCreatedResponse({ description: 'Word created' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  createOne(@Body() body: CreateWordDto) {
    return this.service.create(body);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Add a word/reading on a word entity', description: '**Permission required:** \n- `update:word`' })
  @Patch('/:id/word')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: 'Word/reading added to word', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  addOneWordReading(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateWordReadingDTO) {
    return this.service.addElementToArray(id, body.key, body);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Remove a word/reading from a word entity', description: '**Permission required:** \n- `update:word`' })
  @Delete('/:id/word')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: 'Word/reading removed from word', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  deleteOneWordReading(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateWordReadingDTO) {
    return this.service.removeElementToArray(id, body.key, body);
  }

  @Patch('/:id/definition/:index/type')
  @ApiOperation({ summary: "Add a type to a word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Type added on word's definition", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  addOneWordDefinitionType(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordDefinitionTypeDto) {
    const key = `definition.${index}.type`;

    return this.service.addElementToArray(id, key, body);
  }

  @Delete('/:id/definition/:index/type')
  @ApiOperation({ summary: "Remove a type to a word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Type removed from word's definition", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  deleteOneWordDefinitionType(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordDefinitionTypeDto) {
    const key = `definition.${index}.type`;

    return this.service.removeElementToArray(id, key, body);
  }

  @Patch('/:id/definition/:index/example')
  @ApiOperation({ summary: "Add an example to a word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Example added on word's definition", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  addOneWordDefinitionExample(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.addDefinitionExample(id, index, body);
  }

  @Delete('/:id/definition/:index/example')
  @ApiOperation({ summary: "Remove an example from a word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Example removed from word's definition", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  deleteOneWordDefinitionExample(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.removeDefinitionExample(id, index, body);
  }

  @Patch('/:id/definition/:index/relation')
  @ApiOperation({ summary: "Add a word related to the current word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Word added on word's definition relations", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  addOneWordDefinitionrelation(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.addDefinitionRelation(id, index, body);
  }

  @Delete('/:id/definition/:index/relation')
  @ApiOperation({ summary: "Remove a word related to the current word's definition", description: '**Permission required:** \n- `update:word`' })
  @ApiTags('Definitions')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_WORD]))
  @ApiOkResponse({ description: "Words removed from word's definition relations", type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  deleteOneWordDefinitionRelation(@Param('id', new ParseUUIDPipe()) id: string, @Param('index', new ParseIntPipe()) index: number, @Body() body: UpdateWordUUIDDTO) {
    return this.service.removeDefinitionRelation(id, index, body);
  }

  @ApiTags('Words')
  @ApiOperation({ summary: 'Remove a word', description: '**Permission required:** \n- `remove:word`' })
  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.REMOVE_WORD]))
  @ApiOkResponse({ description: 'Word removed', type: PaginateWordDTO })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  deleteOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.deleteOneById(id);
  }
}
