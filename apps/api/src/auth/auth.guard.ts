import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { IUserCtx, RequestWithUser } from './user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const currentUser: IUserCtx = {
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@example.com',
    };

    request.user = currentUser;

    return true;
  }
}
