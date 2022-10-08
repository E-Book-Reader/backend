import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthUserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import ParseBookPipe from 'src/pipes/ParseBookPipe';
import ParseUserPipe from 'src/pipes/ParseUserPipe';
import { AuthService } from '../auth/auth.service';
import { Book, Privacy } from '../books/book.entity';
import { User } from '../users/user.entity';
import { FilesApi } from './files.api';
import { FilesService } from './files.service';

@Controller('users/:userId/books/:bookId/file')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private authService: AuthService,
    private filesApi: FilesApi,
  ) {}

  @Get()
  async getFile(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    const file = await book.file;
    if (book.privacy === Privacy.PRIVATE) {
      if (!authUserId || authUserId != user.id)
        throw new UnauthorizedException('this file belong to a private book');
      if (authUserId === user.id) return file;
    } else return file;
  }

  @Get('cover')
  //@UseGuards(AuthGuard)
  async getFileCover(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (book.privacy === Privacy.PRIVATE) {
      if (!authUserId || authUserId != user.id)
        throw new UnauthorizedException('this file belong to a private book');
      if (authUserId === user.id) {
        const file = await book.file;
        const auth = await this.authService.refresh(user.id);
        const fileContent = await this.filesApi.downloadFile(
          auth,
          file.coverId,
        );
        return new StreamableFile(fileContent);
      }
    } else {
      const file = await book.file;
      const auth = await this.authService.refresh(user.id);
      const fileContent = await this.filesApi.downloadFile(auth, file.coverId);
      return new StreamableFile(fileContent);
    }
  }

  @Get('content')
  //@UseGuards(AuthGuard)
  async getFileContent(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (book.privacy === Privacy.PRIVATE) {
      if (!authUserId || authUserId != user.id)
        throw new UnauthorizedException('this file belong to a private book');
      if (authUserId === user.id) {
        const file = await book.file;
        const auth = await this.authService.refresh(user.id);
        const fileContent = await this.filesApi.downloadFile(auth, file.fileId);
        return new StreamableFile(fileContent);
      }
    } else {
      const file = await book.file;
      const auth = await this.authService.refresh(user.id);
      const fileContent = await this.filesApi.downloadFile(auth, file.fileId);
      return new StreamableFile(fileContent);
    }
  }
}
