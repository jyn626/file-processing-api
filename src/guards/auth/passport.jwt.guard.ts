import { AuthGuard } from '@nestjs/passport';

// returns `Unauthorized` if no `user` is returned in the Strategy.
// otherwise returns true and `canActive` will be true thus access is authorized
export class JwtGuard extends AuthGuard('jwt') { }