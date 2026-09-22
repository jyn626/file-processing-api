import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/guards/auth/passport.local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  @UseGuards(LocalGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async signIn(@Body() signInDto: SignInDto) {
    // return this.authService.signIn(signInDto);
    return 'success';
  }
}
