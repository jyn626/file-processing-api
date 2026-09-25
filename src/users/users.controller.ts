import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/auth/passport.jwt.guard';
import { CurrentUser } from './user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) { }
  @Get('/me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser() user: { id: string; username: string }) {
    return user;
  }

  // ! TODO: protect this
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
