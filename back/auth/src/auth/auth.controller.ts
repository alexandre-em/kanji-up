import { Body, Controller, Get, Post, Query, Render, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AppsService } from 'src/apps/apps.service';
import { RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './local.guard';

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

  @ApiBody({ description: 'body: { "username": "string", "password": "string" }' })
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    return this.service.login(req.user);
  }

  @Get('register')
  @Render('register')
  registerUser() {
    return {};
  }

  @Post('register')
  register(@Body() registerDTO: RegisterDTO) {
    return this.service.register(registerDTO.name, registerDTO.email, registerDTO.password);
  }

  @Get('reset')
  @Render('forgetpassword')
  forgetPassword() {
    return {};
  }

  @Post('reset')
  sendForgetPasswordConfirmation(@Body() registerDTO: Partial<RegisterDTO>) {
    if (!registerDTO.email) {
      throw new Error('Insert your email to be able to reset the password');
    }

    return this.service.sendEmailReset(registerDTO.email);
  }

  @Get('reset/token')
  @Render('updatepassword')
  changePasswordScreen(@Query('token') token: string) {
    return {
      token,
    };
  }

  @Post('reset/token')
  changePassword(@Body() body: any) {
    return this.service.newPassword(body.token, body.email, body.password);
  }

  @Get('confirmation')
  @Render('confirmed')
  async confirmAccount(@Query('token') token: string) {
    try {
      await this.service.confirmEmail(token);
      return {
        title: 'Confirm succeeded',
        message: 'Thank you for confirming your email address. You can now use KanjiUp applications.',
      };
    } catch (e) {
      return {
        title: 'Confirmation failed',
        message: `An error occured or your confirmation token has expired. Please try again later: ${e.message}`,
      };
    }
  }
}
