import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import JwtAuthenticationGuard from './jwt.guard';
import Permission from 'src/utils/permission.type';

const PermissionGuard = (permissions: Permission[]): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      const request = context.switchToHttp().getRequest<RequestWithUser>();

      const user = request.user;

      if (!user.permissions) {
        return false;
      }

      const isPresent = permissions.map((p: Permission) => user.permissions.includes(p));

      return isPresent.reduce((prev: boolean, total: boolean) => prev && total, true);
    }
  }
  return mixin(PermissionGuardMixin);
};
export default PermissionGuard;
