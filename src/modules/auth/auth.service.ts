import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './auth.entity';

import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configuration: ConfigService,
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
  ) {}

  getAuthUrl(): string {
    const url = new URLSearchParams();
    url.set('client_id', this.configuration.get('google.id'));
    url.set('redirect_uri', this.configuration.get('google.redirects.3'));
    url.set('response_type', 'code');
    url.set(
      'scope',
      this.configuration.get<string[]>('google.scopes').join(' '),
    );
    url.set('prompt', 'consent');
    url.set('access_type', 'offline');
    return this.configuration.get('google.uris.auth') + '?' + url.toString();
  }

  createAuth(
    user: User,
    { access_token, refresh_token, folderId, /*id_token,*/ expires_in },
  ) {
    const auth = new Auth();
    auth.access_token = access_token;
    auth.refresh_token = refresh_token;
    auth.expires_in = expires_in;
    auth.userId = user.id;
    auth.folderId = folderId;
    return this.authRepository.save(auth);
  }

  getAuth(userId: string) {
    return this.authRepository.findOneBy({ userId });
  }

  async hasAccessTokenExpired(userId: string): Promise<boolean> {
    const user = await this.userService.getUser({ id: userId });
    const auth = await user.auth;
    const date = auth.updated_at.getTime();
    const now = Date.now();
    const difference = (now - date) / 1000;
    const response = difference > auth.expires_in;
    if (!response) {
      auth.isValid = false;
      this.authRepository.save(auth);
    }
    return;
  }

  /**
   * TODO: function to check that access_token scopes / permissions are still the same and that the ones used by the app are present
   */

  async isAccessTokenValid(userId: string): Promise<boolean> {
    const user = await this.userService.getUser({ id: userId });
    const auth = await user.auth;
    if (this.hasAccessTokenExpired(user.id)) return false;
    /**TODO: complete logic to check if access has been revoked by user */
    return true;
  }

  async refresh(userId: string): Promise<Auth> {
    const user = await this.userService.getUser({ id: userId });
    const auth = await user.auth;

    if (!user || !auth)
      throw new Error('invalid userId provided to refresh method');

    /**function to check if access has be revoked || access_token/refresh_tokens is valid */
    const hasExpired = this.hasAccessTokenExpired(user.id);

    if (!hasExpired) return auth;

    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {},
        {
          params: {
            client_id: this.configuration.get('google.id'),
            client_secret: this.configuration.get('google.secret'),
            refresh_token: auth.refresh_token,
            grant_type: 'refresh_token',
          },
        },
      );

      auth.access_token = response.data.access_token;
      auth.refresh_token = response.data.refresh_token;
      auth.expires_in = response.data.expires_in;
      auth.isValid = true;

      return await this.authRepository.save(auth);
    } catch (err: any) {
      console.log(err);
      throw new Error('[Error]: failed to refresh token');
    }
  }

  /**
   * TODO: function to check if access_token is still valid
   * TODO: function to check if access_token have the right scopes
   * TODO: function to refresh access_token
   */
}
