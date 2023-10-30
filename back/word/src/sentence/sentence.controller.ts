import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SentenceService } from './sentence.service';
import { CreateSentenceDto, UpdateSentenceDto } from './sentence.dto';
import PermissionGuard from '../security/permission.guard';
import permissions from '../utils/permission.type';

@ApiTags('Sentences')
@Controller('sentences')
export class SentenceController {
  constructor(private service: SentenceService) {}

  @ApiOperation({ summary: 'Get a sentence by id' })
  @ApiOkResponse({ description: 'Authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.service.findOneById(id);
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
