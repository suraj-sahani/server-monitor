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
      id: '00000000-0000-0000-0000-00000000000',
      name: 'Admin',
      email: 'admin@example.com',
    };

    request.user = currentUser;

    return true;
  }
}
