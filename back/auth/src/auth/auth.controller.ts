import { Body, Controller, Get, Post, Query, Render, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AppsService } from 'src/apps/apps.service';
import { RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService, private appService: AppsService) {}

  @Get('login')
  @Render('login')
  async loginUser(@Query('app_id') appId: string) {
    const application = await this.appService.getOne(appId);

    return {
      redirection_url: application?.redirection_url || 'None',
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.service.login(req.user);
  }

  @Get('register')
  @Render('register')
  registerUser() {
    const data = {
      appId: 'Alexandre',
    };

    return data;
  }

  @Post('register')
  register(@Body() registerDTO: RegisterDTO) {
    //TODO: Send a confirmation email

    return this.service.register(registerDTO.name, registerDTO.email, registerDTO.password);
  }
}
