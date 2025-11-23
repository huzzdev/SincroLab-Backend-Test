import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/user/decorators/roles.decorator';
import { RolesGuard } from 'src/user/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users with pagination (Admin only)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Page size',
  })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.userService.findAll(page, limit);
  }

  @HttpCode(200)
  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  findOne(@Param('id') id: UserEntity['id']) {
    return this.userService.findById(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(200)
  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  update(
    @Param('id') id: UserEntity['id'],
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  remove(@Param('id') id: UserEntity['id']) {
    return this.userService.remove(id);
  }
}
