import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { Book } from '../books/book.entity';
import { File } from './file.entity';
import { FilesApi } from './files.api';

@Injectable()
export class FilesService {
  constructor(
    private filesApi: FilesApi,
    @InjectRepository(File) private filesRepository: Repository<File>,
  ) {}

  getFile(query: { id?: string; bookId?: string }) {
    return this.filesRepository.findOne({ where: query });
  }

  async createFile(
    auth: Auth,
    book: Book,
    file: Express.Multer.File,
    cover?: Express.Multer.File,
  ) {
    const driveFile = await this.filesApi.createFile(auth, file, auth.folderId);
    const driveCover = await this.filesApi.createFile(
      auth,
      cover,
      auth.folderId,
    );
    const databaseFile = new File();
    databaseFile.bookId = book.id;
    databaseFile.fileId = driveFile.id;
    databaseFile.coverId = driveCover.id;
    const createdFile = await this.filesRepository.save(databaseFile);
    await this.filesRepository.save(createdFile);
    return createdFile;
  }

  async deleteFile(auth: Auth, query: { id?: string; bookId?: string }) {
    const file = await this.getFile(query);
    this.filesApi.deleteFile(auth, file.fileId);
    this.filesRepository.delete(file.id);
  }
}
