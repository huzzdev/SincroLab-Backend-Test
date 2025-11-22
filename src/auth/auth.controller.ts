import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login')
  login(@Body() body: CreateUserDto) {
    return this.authService.signIn(body);
  }

  @HttpCode(200)
  @Get('logout')
  @UseGuards(AuthGuard)
  logout(@Request() req: { token: string }) {
    return this.authService.logout(req.token);
  }
}
