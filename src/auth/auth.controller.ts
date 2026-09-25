import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/guards/auth/passport.local.guard';
import type { AuthenticatedRequest } from 'src/files/files.controller';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  @UseGuards(LocalGuard)
  async signIn(@Request() request: AuthenticatedRequest) {
    return this.authService.signIn({
      id: request.user.id,
      username: request.user.username,
    });
    // return 'success';
  }
}
