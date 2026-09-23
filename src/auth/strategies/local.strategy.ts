import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/sign-in.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(); // calls the constructor of the parent class
  }

  async validate(payload: SignInDto) {
    const user = await this.authService.validate(payload);
    console.log(user);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
