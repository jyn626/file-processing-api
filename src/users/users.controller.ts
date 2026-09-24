import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/auth/passport.jwt.guard';
import { CurrentUser } from './user.decorator';

@Controller('users')
export class UsersController {
  @Get('/me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser() user: { id: string; username: string }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return user;
  }
}
