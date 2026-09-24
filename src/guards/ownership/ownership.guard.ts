import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // check file ownership for routes like /GET /files/:id
    // TODO: implement
    const request = context.switchToHttp().getRequest<{ user: unknown }>();

    return true;
  }
}
