import { UserEntity } from 'src/user/entity/user.entity';

export class AuthPayloadEntity {
  sub: UserEntity['id'];
  email: UserEntity['email'];
  role: UserEntity['role'];
}
