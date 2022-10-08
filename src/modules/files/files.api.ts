import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { google } from 'googleapis';
import { auth, GoogleAuth } from 'google-auth-library';
import { Stream } from 'stream';
import { Auth } from '../auth/auth.entity';

@Injectable()
export class FilesApi {
  async downloadFile(auth: Auth, fileId: string) {
    const { data }: { data: any } = await google
      .drive({
        version: 'v3',
        headers: {
          Authorization: 'Bearer ' + auth.access_token,
        },
      })
      .files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' },
      );

    const file = Buffer.from(data, 'base64');

    return file;
  }

  async getFile(auth: Auth, fileId: string) {
    const { data } = await google.drive({ version: 'v3' }).files.get({
      fileId,
      //id,name,kind
      fields: '*',
      auth: auth.access_token,
      oauth_token: auth.access_token,
    });
    return data;
    /*
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
        },
      );*/
  }

  async createFile(auth: Auth, file: Express.Multer.File, parentId: string) {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);
    const { data } = await google.drive({ version: 'v3' }).files.create({
      auth: auth.access_token,
      oauth_token: auth.access_token,
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      requestBody: {
        name: file.originalname,
        parents: [parentId],
      },
      fields: 'id,name',
    });
    console.log(data);
    return data;
  }

  async deleteFile(auth: Auth, fileId: string) {
    const { data } = await google.drive({ version: 'v3' }).files.delete({
      fileId,
      auth: auth.access_token,
      oauth_token: auth.access_token,
      fields: 'id,name',
    });
    return data;
    /*
    await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    });
    */
  }
}
