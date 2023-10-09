import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
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
import permissions from '../utils/permission.type';
import permissionGuard from '../auth/permission.guard';
import JwtAuthenticationGuard from '../auth/jwt.guard';
import { UpdatedDataResponse, UserDetailResponse, UserScoreResponse, UserShortResponse } from './users.entity';

const USER_DELAY_EXPIRATION = 7; // 7 days

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService, private readonly jwtService: JwtService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  @ApiOkResponse({ description: 'Authenticated user profile', type: UserDetailResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getOne(@Req() req: any) {
    return this.service.getOne(req.user?.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile/:id')
  @ApiOkResponse({ description: 'Selectionned user profile', type: UserDetailResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse()
  getUser(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('profile')
  @ApiOkResponse({ description: 'Authenticated user info has been updated', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  updateUserInfo(@Req() req: any, @Body() body: UpdateUserDTO) {
    return this.service.updateOne(req.user, body);
  }

  @Get('profile/image/:id')
  @ApiOkResponse({ description: 'Image binary' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @Put('profile/image')
  @ApiCreatedResponse({ description: 'Authenticated user image has been updated', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiConflictResponse({ description: 'Image already uploaded' })
  @ApiUnprocessableEntityResponse({ description: 'Image format not supported or size > 1.5Mb' })
  uploadImage(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1500000 }), new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.uploadImage(req.user, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('friends/:id/follow')
  @ApiOkResponse({ description: 'List of all user who are friend of the selected user', type: UserShortResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserFollow(@Param('id') id: string, @Req() req: any) {
    return id === req.user?.user_id ? req.user.friends : this.service.getUserFollowList(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('friends/:id/followers')
  @ApiOkResponse({ description: 'List of all user who are friend of the selected user', type: UserShortResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserFollower(@Param('id') id: string) {
    return this.service.getUserFollowerList(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('friends/:id')
  @ApiOkResponse({ description: 'User is added on friend list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Already on the friend list of the current user' })
  addUserFriend(@Req() req: any, @Param('id') id: string) {
    return this.service.addUserFriend(req.user, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOkResponse({ description: 'User is removed from the friend list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete('friends/:id')
  removeUserFriend(@Req() req: any, @Param('id') id: string) {
    return this.service.removeUserFriend(req.user, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(permissionGuard([permissions.ADD_USER_PERMISSION]))
  @Patch('permissions/:id')
  @ApiOkResponse({ description: 'Permission(s) is/are added on permissions list of the authenticated user', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Already on the permission list of the user' })
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
  deleteUser(@Req() req: any) {
    const date = new Date();
    const expireAt = new Date(date.setDate(date.getDate() + USER_DELAY_EXPIRATION));

    return this.service.updateOne(req.user, { deleted_at: new Date(), expireAt });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('score/:id')
  @ApiOkResponse({ description: 'User s Application scores', type: UserScoreResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getAppUserScore(@Req() req: any, @Param('id') id: string, @Query('app') app?: 'kanji' | 'word') {
    if (app !== 'kanji' && app !== 'word') {
      throw new BadRequestException('Invalid application type');
    }

    if (req.user.user_id === id) return req.user.applications[app];

    const scores = await this.service.getUserAppScore(id, app);

    return scores?.applications[app];
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Put('score/:app')
  @ApiOkResponse({ description: 'User s Application scores updated', type: UpdatedDataResponse })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateAppUserScore(@Req() req: any, @Param('app') app: string, @Body() body: UpdateUserAppDTO) {
    return this.service.updateUserApp(req.user, app, body);
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
