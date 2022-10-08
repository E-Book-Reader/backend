import { Controller, forwardRef, Inject, Query, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Response, Response as ResponseInterface } from 'express';
import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { UserService } from '../users/user.service';

import { ConfigService } from '@nestjs/config';

import * as Jwt from 'jsonwebtoken';
import { ApiService } from '../api/api.service';
import ExchangeCodeResponse from '../api/interfaces/ExchangeCodeResponse';
import UserInfoResponse from '../api/interfaces/UserInfoResponse';
import JwtPayloadInterface from 'src/interfaces/JwtPayloadInterface';

/**
 * TODO: some route to call to refresh user, if new properties habe been added or something simillar
 */

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => ApiService)) private apiService: ApiService,
    private authService: AuthService,
    private userService: UserService,
    private configuration: ConfigService,
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
  ) {}

  @Get()
  authenticate(): string {
    return this.authService.getAuthUrl();
  }

  @Get('info')
  test() {
    return this.authRepository.find();
  }

  @Get('/test')
  auth(@Res() res: Response) {
    res.cookie(
      'jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hZGlya2ljaG91NUBnbWFpbC5jb20iLCJpYXQiOjE2NjQzNjE1OTd9.BXCAnJeemL-2-CdIkkyG6221AJwjMuU4KOuYxRN4LmY',
      { httpOnly: true },
    );
    res.json({ message: 'OK!' });
  }

  /**
   * TODO: incase app in future require more scopes don't forget to make something that ask user for re-auth and save new access/refresh tokens
   */
  /**THROW Errors instead of returining stuff */
  /**Send cookies wihtout useing Res instance */
  @Get('/callback')
  async handle(
    @Res() res: ResponseInterface,
    @Query('code') code: string,
    @Query('error') error: string,
  ) {
    if (!code || error) return res.status(404).send(error);

    let userInfo: UserInfoResponse;
    let data: ExchangeCodeResponse;

    try {
      data = await this.apiService.getToken(code);
    } catch (err: any) {
      console.log(err);
      res.status(400).send('err while fetching tokens');
      return;
      throw new Error('[Error]: ' + 'unknown');
    }

    try {
      userInfo = await this.apiService.getUserInfo(data.access_token);
      console.log(userInfo);
    } catch (err: any) {
      res.status(400).send('err while fetching userInfo');
      return;
      throw new Error('[Error]: ' + 'unknown');
    }

    const email = userInfo.email;
    let user = await this.userService.getUser({ email });

    if (user == null) {
      user = await this.userService.createUser({
        email,
        username: userInfo.name,
        picture: userInfo.picture,
      });

      const folder: any = await this.apiService.createFolder(
        data.access_token,
        'gysm',
      );

      console.log(folder);

      const auth = await this.authService.createAuth(user, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        folderId: folder.id,
      });

      const payload: JwtPayloadInterface = {
        id: String(user.id),
      };

      const token = Jwt.sign(payload, this.configuration.get('server.secret'));
      res.cookie('jwt', token, { httpOnly: true });
      res.json(userInfo);
    } else {
      /**
       * TODO: if cookie already exist don't create it
       * TODO: verify that everything is ok (drive, tokens, ...)
       */
      const token = Jwt.sign(
        { id: String(user.id) },
        this.configuration.get('server.secret'),
      );
      res.cookie('jwt', token, { httpOnly: true });
      res.json(user);
    }
  }
}
