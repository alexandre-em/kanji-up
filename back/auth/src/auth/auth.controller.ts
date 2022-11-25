import { Body, Controller, Get, Post, Query, Render } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppsService } from 'src/apps/apps.service';
import { User } from 'src/users/users.schema';
import { LoginDTO, RegisterDTO } from './auth.dto';
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

  @Post('login')
  async login(@Body() req: LoginDTO) {
    const user = await this.service.validateUser(req.email, req.password);
    return this.service.login(user as User);
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

    return this.service.register(
      registerDTO.name,
      registerDTO.email,
      registerDTO.password,
    );
  }
}
