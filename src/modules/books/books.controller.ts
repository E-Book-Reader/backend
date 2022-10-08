import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AuthUserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import ParseBookPipe from 'src/pipes/ParseBookPipe';
import ParseUserPipe from 'src/pipes/ParseUserPipe';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { FilesApi } from '../files/files.api';
import { FilesService } from '../files/files.service';
import { User } from '../users/user.entity';
import { Book, Privacy } from './book.entity';
import { BooksService } from './books.service';
import { CreateBookDto } from './dtos/CreateBookDto';
import { UpdateBookDto } from './dtos/UpdateBookDto';

//@Controller('users/:userId/books')
@Controller()
export class BooksController {
  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private apiService: ApiService,
    @Inject(forwardRef(() => FilesService))
    private fileService: FilesService,
  ) {}

  @Get('/books/:bookId')
  async getDriveBooks(
    @AuthUserId() authUserId: string,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (book.privacy === Privacy.PUBLIC) return book;
    if (authUserId !== book.ownerId)
      throw new UnauthorizedException('book is private');
    return book;
  }

  @Get('/books')
  getBooks(
    @Query('query') query: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    /*
    default value for page is 1,
    default value for limit is 10 and limits can go from 1 up to 20 (maybe making limit:pageSize) fixed
    default value for query is "", for now
    */
    return this.booksService.getPublicBooks(limit, page);
  }

  @Get('users/:userId/books')
  async getUserBooks(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
  ) {
    console.log(user);
    const books = await user.books;
    if (!authUserId || authUserId !== user.id)
      return books.filter((book) => book.privacy === Privacy.PUBLIC);
    else return books;
  }

  /*eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hZGlya2ljaG91NUBnbWFpbC5jb20iLCJpYXQiOjE2NjQzNjE1OTd9.BXCAnJeemL-2-CdIkkyG6221AJwjMuU4KOuYxRN4LmY*/

  @Get('users/:userId/books/:bookId')
  async getBook(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (book.ownerId != user.id)
      throw new NotFoundException("bookId don't belong to this user");
    if (
      book.privacy === Privacy.PRIVATE &&
      (!authUserId || authUserId !== user.id)
    )
      throw new UnauthorizedException('this book is private');
    return book;
  }

  /**
   * TODO: be sure that the pdf we received is a pdf file
   * TODO: acceppt a book cover image alongside with the book pdf
   * TODO: make sure that the book image is jpg
   * TODO: make sure that the pdf don't surpass a certain weight
   * TODO: if no book cover was provided we put the first pdf image as the book cover / or we create one with the first book letter like
   */

  @Post('users/:userId/books')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'book', maxCount: 1 },
        {
          name: 'cover',
          maxCount: 1,
        },
      ],
      /*
      {
        fileFilter(req, file, callback) {
          if (file.mimetype !== 'application/pdf')
            callback({ name: 'error', message: 'acceppt only pdf' }, false);
          callback(null, true);
        },
      },
      */
    ),
  )
  async createBook(
    @AuthUserId() authUserId: string,
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles()
    files: { book?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Param('userId', ParseUserPipe) user: User,
  ) {
    if (!files || !files.book || !files.cover)
      throw new BadRequestException('please provide correct files');

    const bookFile = files.book[0];
    const coverFile = files.cover[0];

    if (authUserId !== user.id) throw new UnauthorizedException();
    if (!bookFile || !coverFile)
      throw new BadRequestException('no file was provided');
    const auth = await this.authService.refresh(user.id);
    console.log('uploading');
    const book = await this.booksService.createBook(createBookDto, user);
    const databaseFile = await this.fileService.createFile(
      auth,
      book,
      bookFile,
      coverFile,
    );
    console.log('uploaded');
    return { book, file: databaseFile };
  }

  /**
    @Post('users/:userId/books')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createBook(
    @AuthUserId() authUserId: string,
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('userId', ParseUserPipe) user: User,
  ) {
    if (authUserId !== user.id) throw new UnauthorizedException();
    if (!file) throw new BadRequestException('no file was provided');
    const auth = await this.authService.refresh(user.id);
    console.log('uploading');
    const book = await this.booksService.createBook(createBookDto, user);
    const databaseFile = await this.fileService.createFile(auth, book, file);
    console.log('uploaded');
    return { book, file: databaseFile };
  }
   */

  @Post('users/:userId/books/:bookId')
  @UseGuards(AuthGuard)
  async updateBook(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    if (authUserId !== user.id) throw new UnauthorizedException();
    if (book.ownerId != user.id)
      throw new NotFoundException("bookId don't belong to this user");
    const updatedBbook = await this.booksService.updateBook(
      book.id,
      updateBookDto,
    );
    return updatedBbook;
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteBook(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (authUserId !== user.id)
      throw new UnauthorizedException("book don't belong to you");
    return this.booksService.deleteBook(book);
  }
}
