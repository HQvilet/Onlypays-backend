import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract the authenticated user's ID
 * forwarded by Envoy Gateway in the `X-User-Id` HTTP header.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return (
      (request.headers['x-user-id'] as string) ||
      (request.headers['X-User-Id'] as string) ||
      undefined
    );
  },
);
