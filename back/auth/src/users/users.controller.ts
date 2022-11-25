import { Body, Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.service.getOne(id);
  }
}
