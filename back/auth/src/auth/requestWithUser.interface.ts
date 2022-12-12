import { Request } from '@nestjs/common';
import { User } from 'src/users/users.schema';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
