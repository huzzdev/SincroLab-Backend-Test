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
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { AuthPayloadEntity } from './entities/auth-payload.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UsePipes(new ValidationPipe())
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Basic registration',
        value: {
          email: 'therapist@example.com',
          password: 'P@ssw0rd123',
        },
      },
    },
  })
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Public()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Basic login',
        value: {
          email: 'therapist@example.com',
          password: 'P@ssw0rd123',
        },
      },
    },
  })
  login(@Body() body: CreateUserDto) {
    return this.authService.signIn(body);
  }

  @HttpCode(200)
  @Get('user')
  @ApiOperation({ summary: 'Get current user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Basic login',
        value: {
          email: 'therapist@example.com',
          password: 'P@ssw0rd123',
        },
      },
    },
  })
  me(@Request() request: { user: AuthPayloadEntity; token: string }) {
    return {
      user: request.user,
    };
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @Get('logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logout current user (revoke access token)' })
  logout(@Request() req: { token: string }) {
    return this.authService.logout(req.token);
  }
}
