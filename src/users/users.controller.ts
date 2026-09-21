import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/auth/jwt.guard';

@Controller('users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get()
  getMe(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }
}
