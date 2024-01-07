import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info?.message == 'No auth token') {
      throw new BadRequestException('Missing Access Token');
    }

    if (info?.message == 'jwt malformed') {
      throw new BadRequestException('Malformed Access Token');
    }

    if (info?.message == 'jwt expired') {
      throw new BadRequestException('Expired Access Token');
    }

    if (info?.message == 'invalid signature') {
      throw new BadRequestException('Invalid Access Token');
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
