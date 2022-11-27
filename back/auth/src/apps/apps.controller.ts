import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthorizeAppDTO, CreateAppDTO, DeleteAppDTO, UpdateAppDTO } from './apps.dto';
import { AppsService } from './apps.service';

@ApiTags('Apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly service: AppsService) {}

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  createOne(@Body() body: CreateAppDTO) {
    return this.service.createOne(body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:id')
  updateOne(@Param('id') id: string, @Body() body: UpdateAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('authorize/:id')
  authorizeOne(@Param('id') id: string, @Body() body: AuthorizeAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteOne(@Param('id') id: string, @Body() body: DeleteAppDTO) {
    return this.service.updateOne(id, body);
  }
}
