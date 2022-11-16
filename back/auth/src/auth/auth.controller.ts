import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/users.schema';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  async login(@Body() req: LoginDTO) {
    const user = await this.service.validateUser(req.email, req.password);
    return this.service.login(user as User);
  }

  @Post('register')
  register(@Body() registerDTO: RegisterDTO) {
    return this.service.register(
      registerDTO.name,
      registerDTO.email,
      registerDTO.password,
    );
  }
}
