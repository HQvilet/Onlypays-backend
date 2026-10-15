import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard that ensures the caller has been authenticated by Envoy Gateway
 * and injected with the `X-User-Id` header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId =
      (request.headers['x-user-id'] as string) ||
      (request.headers['X-User-Id'] as string);

    if (!userId) {
      throw new UnauthorizedException('Authentication required: missing X-User-Id header');
    }

    request.userId = userId;
    return true;
  }
}
