import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { jwtSecret } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // this is where we get the token
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // this passport strategy handles the verifying of token.
  // this method validates the token from the `jwtFromRequest`
  // and whatever this method returns will be stored in req.user
  validate(payload: { username: string; id: number }) {
    return payload;
  }
}
