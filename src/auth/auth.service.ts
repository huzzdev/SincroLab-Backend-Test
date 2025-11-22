import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entity/user.entity';
import { AuthPayloadEntity } from './entity/auth-payload.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // We can use a cache layer like Redis to store the revoked access tokens went with this approach for simplicity
  private revokedAccessToken: string[] = [];

  async register({ email, password }: CreateUserDto) {
    const user = await this.userService.findOne({ email });
    if (user) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.userService.create({
      email,
      password: hashedPassword,
    });

    const payload = this.getUserTokenPayload(newUser);
    return {
      user: payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  async signIn({ email, password }: CreateUserDto) {
    const user = await this.userService.findOne({ email });
    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = this.getUserTokenPayload(user);
    return {
      user: payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  logout(accessToken: string) {
    this.revokedAccessToken.push(accessToken);
  }

  isAccessTokenRevoked(accessToken: string) {
    return this.revokedAccessToken.includes(accessToken);
  }

  getUserTokenPayload({ id, email, role }: UserEntity): AuthPayloadEntity {
    return {
      sub: id,
      email: email,
      role: role,
    };
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
