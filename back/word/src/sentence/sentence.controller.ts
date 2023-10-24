import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SentenceService } from './sentence.service';
import { CreateSentenceDto, UpdateSentenceDto } from './sentence.dto';

@ApiTags('Sentences')
@Controller('sentences')
export class SentenceController {
  constructor(private service: SentenceService) {}

  @ApiOkResponse({ description: 'Authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.service.findOneById(id);
  }

  @Post('')
  createOne(@Body() body: CreateSentenceDto) {
    // return this.service.create(body);
    return body;
  }

  @Patch('/:id')
  updateOne(@Param('id') id: string, @Body() body: UpdateSentenceDto) {
    return this.service.updateOneById(id, body);
  }

  @Delete('/:id')
  deleteOne(@Param('id') id: string) {
    return this.service.deleteOneById(id);
  }
}
