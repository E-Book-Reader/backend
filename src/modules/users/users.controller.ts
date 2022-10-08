import * as fs from 'fs';
import axios from 'axios';
import { response, Response } from 'express';
import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';

import { User } from './user.entity';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import ParseUserPipe from 'src/pipes/ParseUserPipe';
import { AuthUserId } from 'src/decorators/user.decorator';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UserService,
    private authService: AuthService,
  ) {}
  @Get('me')
  @UseGuards(AuthGuard)
  async me(@AuthUserId() authUserId: string) {
    const authUser = this.usersService.getUser({ id: authUserId });
    return authUser;
  }

  @Get('me/picture')
  @UseGuards(AuthGuard)
  async mePicture(@AuthUserId() authUserId: string) {
    const authUser = this.usersService.getUser({ id: authUserId });
    return authUser;
  }

  @Get(':userId')
  getUser(@Param('userId', ParseUserPipe) user: User) {
    return user;
  }

  @Get(':userId/picture')
  async getPicture(@Param('userId', ParseUserPipe) user: User) {
    const auth = await this.authService.refresh(user.id);

    const response = await axios.get(user.picture, {
      headers: {
        Authorization: 'Bearer ' + auth.access_token,
      },
      responseType: 'arraybuffer',
    });

    const picture = Buffer.from(response.data, 'base64');

    return new StreamableFile(picture);
  }
}
