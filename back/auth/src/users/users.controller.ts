import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Headers,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UpdateUserAppDTO, UpdateUserDTO, UpdateUserPermissionsDTO } from './users.dto';
import { UsersService } from './users.service';
import permissions from 'src/utils/permission.type';
import permissionGuard from 'src/auth/permission.guard';
import JwtAuthenticationGuard from 'src/auth/jwt.guard';
import { UpdatedDataResponse, UserDetailResponse, UserShortResponse } from './users.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService, private readonly jwtService: JwtService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  @ApiOkResponse({ description: 'Authenticated user profile', type: UserDetailResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getOne(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.getOne(decodedJwtAccessToken?.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  @ApiOkResponse({ description: 'Selectionned user profile', type: UserDetailResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse()
  getUser(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('info')
  @ApiOkResponse({ description: 'Authenticated user info has been updated', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  updateUserInfo(@Headers() headers: any, @Body() body: UpdateUserDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateOne(decodedJwtAccessToken?.sub, body);
  }

  @Get('profile/image/:id')
  @ApiOkResponse({ description: 'Image binary' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ description: 'Authenticated user info has been updated', type: UpdatedDataResponse })
  async getOneImage(@Param('id') id: string, @Res() res: Response) {
    const { stream, length, type } = await this.service.getOneImage(id);

    res.set({
      'Content-Type': type,
      'Content-Length': length,
    });

    return stream.pipe(res);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthenticationGuard)
  @Put('image')
  @ApiCreatedResponse({ description: 'Authenticated user image has been updated', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiUnprocessableEntityResponse({ description: 'Image already uploaded' })
  @ApiBadRequestResponse({ description: 'Image format is incorrect or size > 1.5 Mb' })
  uploadImage(
    @Headers() headers: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1500000 }), new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.uploadImage(decodedJwtAccessToken?.sub, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('friends/:id')
  @ApiOkResponse({ description: 'List of all user who are friend of the selected user', type: UserShortResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserMutualFriend(@Param('id') id: string) {
    return this.service.getUserMutualFriend(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('friends/:id')
  @ApiOkResponse({ description: 'User is added on friend list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  addUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.addUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOkResponse({ description: 'User is removed from the friend list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete('friends/:id')
  removeUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.removeUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(permissionGuard([permissions.ADD_USER_PERMISSION]))
  @Patch('permissions/:id')
  @ApiOkResponse({ description: 'Permission(s) is/are added on permissions list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  addUserPermissions(@Param('id') id: string, @Body() newPermissions: UpdateUserPermissionsDTO) {
    return this.service.addUserPermissions(id, newPermissions);
  }

  @ApiBearerAuth()
  @UseGuards(permissionGuard([permissions.REMOVE_USER_PERMISSION]))
  @Delete('permissions/:id')
  @ApiOkResponse({ description: 'Permission(s) is/are removed from permissions list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'You do not have the permissions to execute this request' })
  removeUserPermissions(@Param('id') id: string, @Body() permissions: UpdateUserPermissionsDTO) {
    return this.service.removeUserPermissions(id, permissions);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Delete('')
  @ApiOkResponse({ description: 'User removed', type: UpdatedDataResponse })
  deleteUser(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateOne(decodedJwtAccessToken?.sub, { deleted_at: new Date() });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Put('score/:app')
  @ApiOkResponse({ description: 'User s Application scores', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateAppUserScore(@Headers() headers: any, @Param('app') app: string, @Body() body: UpdateUserAppDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateUserApp(decodedJwtAccessToken?.sub, app, body);
  }

  @Get('ranks/:app')
  @ApiOkResponse({ description: 'List of users sorted by application score', type: UserShortResponse, isArray: true })
  getRank(@Param('app') app: string, @Query('limit') limit?: number) {
    return this.service.getRanking(app, limit);
  }

  @Get('search/user')
  @ApiOkResponse({ description: 'List of users that matched the query', type: UserShortResponse, isArray: true })
  searchUser(@Query('search') search: string) {
    return this.service.searchUser(search);
  }
}
