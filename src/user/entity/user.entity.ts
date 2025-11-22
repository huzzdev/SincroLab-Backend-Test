import { User } from 'generated/prisma/client';

export type UserEntity = User;
export type CreateUserEntity = Pick<UserEntity, 'id' | 'email' | 'role'>;
