import { Injectable } from '@nestjs/common';
import axios from 'axios';
import UserInfoResponse from './interfaces/UserInfoResponse';
import { ConfigService } from '@nestjs/config';
import ExchangeCodeResponse from './interfaces/ExchangeCodeResponse';
import { UserService } from '../users/user.service';

@Injectable()
export class ApiService {
  constructor(private configuration: ConfigService) {}

  getUserInfoUrl(): string {
    return 'https://www.googleapis.com/oauth2/v3/userinfo/';
  }

  async getUserInfo(access_token: string) {
    const url = this.getUserInfoUrl();
    const response = await axios.get<UserInfoResponse>(url, {
      params: { access_token },
    });
    return response.data;
  }

  async getToken(code: string) {
    const url = this.configuration.get('google.uris.token');
    const response = await axios.post<ExchangeCodeResponse>(
      url,
      {},
      {
        params: {
          client_id: this.configuration.get('google.id'),
          client_secret: this.configuration.get('google.secret'),
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.configuration.get('google.redirects.3'),
        },
      },
    );

    return response.data;
  }

  /**
   * create Gysm folder
   * verify if it's present
   * get gysm folder
   * get gysm folder and create if if not present
   */

  async getOrCreateGysmFolder(access_token: string, folderId: string) {
    const folder = await this.getFolderById('gysm', access_token);
    return folder;
  }

  async createFile(
    access_token: string,
    name: string,
    content: string,
    parent: string,
  ) {
    try {
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files',
        {
          name,
          parents: [parent],
          description: 'book created by gysm',
          file: 'yoo am the file content you recognize me ?',
        },
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
          params: {
            uploadType: 'media',
          },
        },
      );
      console.log('file created:', response.data);
      return response.data;
    } catch (err: any) {
      console.log(err);
      return err;
    }
  }

  async createFolder(access_token: string, name: string) {
    try {
      const response = await axios.post(
        'https://www.googleapis.com/drive/v2/files',
        {
          name,
          title: name,
          mimeType: 'application/vnd.google-apps.folder',
        },
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
        },
      );
      console.log('data:', response.data);
      return response.data;
    } catch (err: any) {
      console.log(err);
      return err;
    }
  }

  async getFolderById(access_token: string, folderId: string) {
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${folderId}`,
      {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      },
    );
    return response.data;
  }

  async getFiles(access_token: string) {
    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      },
    );

    return response.data;
  }
}
