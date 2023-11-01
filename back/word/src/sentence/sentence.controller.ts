import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SentenceService } from './sentence.service';
import { CreateSentenceDto, PaginatedSentenceDTO, SentenceByIdDTO, UpdateSentenceDto } from './sentence.dto';
import PermissionGuard from '../security/permission.guard';
import permissions from '../utils/permission.type';

@ApiTags('Sentences')
@Controller('sentences')
export class SentenceController {
  constructor(private service: SentenceService) {}

  @ApiOperation({ summary: 'Get a paginated list of words' })
  @ApiOkResponse({ description: 'List of words', type: PaginatedSentenceDTO })
  @ApiBadRequestResponse({ description: 'Query value invalid. Must be a number' })
  @Get('')
  getAll(@Query('page', new ParseIntPipe()) page?: number, @Query('limit', new ParseIntPipe()) limit?: number) {
    return this.service.findAllPaginate(page, limit);
  }

  @ApiOperation({ summary: 'Get a paginated list of words' })
  @ApiOkResponse({ description: 'List of words', type: PaginatedSentenceDTO })
  @ApiBadRequestResponse({ description: 'Query value invalid. Must be a number' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('/selected/ids')
  getByIds(@Query() ids: SentenceByIdDTO) {
    return this.service.findByIds(ids.ids);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.ADD_SENTENCE]))
  @ApiOperation({ summary: 'Create a sentence', description: '**Permission required:** \n- `add:sentence`' })
  @ApiCreatedResponse({ description: 'Sentence created' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  @Post('')
  createOne(@Body() body: CreateSentenceDto) {
    return this.service.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_SENTENCE]))
  @ApiOperation({ summary: 'Update a sentence', description: '**Permission required:** \n- `update:sentence`' })
  @ApiOkResponse({ description: 'Sentence updated' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  @Patch('/:id')
  updateOne(@Param('id') id: string, @Body() body: UpdateSentenceDto) {
    return this.service.updateOneById(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.REMOVE_SENTENCE]))
  @ApiOperation({ summary: 'Remove a sentence', description: '**Permission required:** \n- `remove:sentence`' })
  @ApiOkResponse({ description: 'Sentence deleted' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permission' })
  @Delete('/:id')
  deleteOne(@Param('id') id: string) {
    return this.service.deleteOneById(id);
  }
}
