import { Body, Controller, Headers, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import PermissionGuard from 'src/auth/permission.guard';
import { UpdatedDataResponse } from 'src/users/users.entity';
import permissions from 'src/utils/permission.type';
import { AuthorizeAppDTO, CreateAppDTO, DeleteAppDTO, UpdateAppDTO } from './apps.dto';
import { AppResponse } from './apps.entity';
import { AppsService } from './apps.service';

@ApiTags('Apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly service: AppsService, private readonly jwtService: JwtService) {}

  @Get(':id')
  @ApiOkResponse({ description: 'Application detail', type: AppResponse })
  @ApiNotFoundResponse({ description: 'Application not found' })
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.ADD_APP]))
  @ApiCreatedResponse({ description: 'Application created', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  @Post('')
  createOne(@Headers() headers: any, @Body() body: CreateAppDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.createOne(decodedJwtAccessToken?.sub, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_APP]))
  @Patch('update/:id')
  @ApiOkResponse({ description: 'Application updated', type: UpdatedDataResponse })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  updateOne(@Param('id') id: string, @Body() body: UpdateAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.UPDATE_APP]))
  @Patch('authorize/:id')
  @ApiOkResponse({ description: 'Application updated', type: UpdatedDataResponse })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  authorizeOne(@Param('id') id: string, @Body() body: AuthorizeAppDTO) {
    return this.service.updateOne(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard([permissions.REMOVE_APP]))
  @Delete(':id')
  @ApiOkResponse({ description: 'Application deleted', type: UpdatedDataResponse })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  deleteOne(@Param('id') id: string, @Body() body: DeleteAppDTO) {
    return this.service.updateOne(id, body);
  }
}
