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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UpdateUserAppDTO, UpdateUserPermissionsDTO } from './users.dto';
import { UsersService } from './users.service';
import permissions from 'src/utils/permission.type';
import permissionGuard from 'src/auth/permission.guard';
import JwtAuthenticationGuard from 'src/auth/jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService, private readonly jwtService: JwtService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  getOne(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.getOne(decodedJwtAccessToken?.sub);
  }

  @Get('profile/image/:id')
  async getOneImage(@Param('id') id: string, @Res() res: Response) {
    const { stream, length } = await this.service.getOneImage(id);

    res.set({
      'Content-Type': 'image/png',
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
  uploadImage(
    @Headers() headers: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1500000 }), new FileTypeValidator({ fileType: 'png' })],
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
  @Get('friends')
  getUserFriend(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.getUserFriend(decodedJwtAccessToken?.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('friends/:id')
  addUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.addUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Delete('friends/:id')
  removeUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.removeUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(permissionGuard([permissions.ADD_USER_PERMISSION]))
  @Patch('permissions/:id')
  addUserPermissions(@Param('id') id: string, @Body() newPermissions: UpdateUserPermissionsDTO) {
    return this.service.addUserPermissions(id, newPermissions);
  }

  @ApiBearerAuth()
  @UseGuards(permissionGuard([permissions.REMOVE_USER_PERMISSION]))
  @Delete('permissions/:id')
  removeUserPermissions(@Param('id') id: string, @Body() permissions: UpdateUserPermissionsDTO) {
    return this.service.removeUserPermissions(id, permissions);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Delete('users')
  deleteUser(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateOne(decodedJwtAccessToken?.sub, { deleted_at: new Date() });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Put('score/:app')
  updateAppUserScore(@Headers() headers: any, @Param('app') app: string, @Body() body: UpdateUserAppDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateUserApp(decodedJwtAccessToken?.sub, app, body);
  }

  @Get('ranks/:app')
  getRank(@Param('app') app: string, @Query('limit') limit?: number) {
    return this.service.getRanking(app, limit);
  }
}
