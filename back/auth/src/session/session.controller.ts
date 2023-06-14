import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/jwt.guard';
import { SessionService } from './session.service';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private service: SessionService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('check')
  checkSession(@Headers() headers: any) {
    const accessToken = headers.authorization.split(' ')[1];

    return this.service.checkTokenValidity(accessToken);
  }
}
