import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import JwtAuthenticationGuard from './jwt.guard';
import Permission from 'src/utils/permission.type';

const PermissionGuard = (permissions: Permission[]): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      console.log('canActivate start');
      await super.canActivate(context);
      const request = context.switchToHttp().getRequest<RequestWithUser>();

      console.log('request content', request);

      const user = request.user;

      if (!user.permissions) {
        return false;
      }

      const isPresent = permissions.map((p: Permission) => user.permissions.includes(p));

      console.log('canActivate end');
      return isPresent.reduce((prev: boolean, total: boolean) => prev && total, true);
    }
  }
  return mixin(PermissionGuardMixin);
};
export default PermissionGuard;
