import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { UserEntity } from '../entity/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: UserEntity['email'];

  @IsString()
  @MinLength(8)
  @MaxLength(25)
  password: UserEntity['password'];
}
