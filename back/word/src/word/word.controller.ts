import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { WordService } from './word.service';
import { CreateWordDto, UpdateWordDto } from './word.dto';

@ApiTags('Words')
@Controller('words')
export class WordController {
  constructor(private service: WordService) {}

  @ApiOkResponse({ description: 'Authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.service.findOneById(id);
  }

  @ApiOkResponse({ description: 'Authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Get('/')
  getAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.findAllPaginate(page, limit);
  }

  @Post('')
  createOne(@Body() body: CreateWordDto) {
    // return this.service.create(body);
    return body;
  }

  @Patch('/:id')
  updateOne(@Param('id') id: string, @Body() body: UpdateWordDto) {
    return this.service.updateOneById(id, body);
  }

  @Delete('/:id')
  deleteOne(@Param('id') id: string) {
    return this.service.deleteOneById(id);
  }
}
