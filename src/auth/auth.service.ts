import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register({ email, password }: CreateUserDto) {
    const hashedPassword = await this.hashPassword(password);
    return this.userService.create({ email, password: hashedPassword });
  }

  async signIn({ email, password }: CreateUserDto) {
    const user = await this.userService.findOne({ email });
    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, userPassword);
  }
}
