import { Body, Controller, Delete, FileTypeValidator, Get, Headers, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UpdateUserPermissionsDTO } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService, private readonly jwtService: JwtService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getOne(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.getOne(decodedJwtAccessToken?.sub);
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @Patch('friend/:id')
  addUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.addUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('friend/:id')
  removeUserFriend(@Headers() headers: any, @Param('id') id: string) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.removeUserFriend(decodedJwtAccessToken?.sub, { user_id: id });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('permissions')
  addUserPermissions(@Headers() headers: any, @Body() permissions: UpdateUserPermissionsDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.addUserPermissions(decodedJwtAccessToken?.sub, permissions);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('permissions')
  removeUserPermissions(@Headers() headers: any, @Body() permissions: UpdateUserPermissionsDTO) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.removeUserPermissions(decodedJwtAccessToken?.sub, permissions);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('user')
  deleteUser(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];
    const decodedJwtAccessToken = this.jwtService.decode(accessToken);

    return this.service.updateOne(decodedJwtAccessToken?.sub, { deleted_at: new Date() });
  }
}
