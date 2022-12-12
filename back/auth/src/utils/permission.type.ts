import AppsPermissions from './appsPermissions';
import UsersPermissions from './usersPermissions';

const Permission = { ...AppsPermissions, ...UsersPermissions };

type Permission = AppsPermissions | UsersPermissions;

export default Permission;
