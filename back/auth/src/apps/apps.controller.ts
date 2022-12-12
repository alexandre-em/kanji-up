import { Body, Controller, Headers, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import PermissionGuard from 'src/auth/permission.guard';
import permissions from 'src/utils/permission.type';
import { AuthorizeAppDTO, CreateAppDTO, DeleteAppDTO, UpdateAppDTO } from './apps.dto';
import { AppsService } from './apps.service';

@ApiTags('Apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly service: AppsService, private readonly jwtService: JwtService) {}

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.ADD_APP]))
  @Post('')
  createOne(@Headers() headers: any, @Body() body: CreateAppDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.createOne(decodedJwtAccessToken?.sub, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_APP]))
  @Patch('update/:id')
  updateOne(@Param('id') id: string, @Body() body: UpdateAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_APP]))
  @Patch('authorize/:id')
  authorizeOne(@Param('id') id: string, @Body() body: AuthorizeAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.REMOVE_APP]))
  @Delete(':id')
  deleteOne(@Param('id') id: string, @Body() body: DeleteAppDTO) {
    return this.service.updateOne(id, body);
  }
}
