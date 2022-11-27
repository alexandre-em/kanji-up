import { Body, Controller, Delete, Get, Headers, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
}
