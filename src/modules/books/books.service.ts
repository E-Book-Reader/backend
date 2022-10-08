import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, Privacy } from './book.entity';
import { UserService } from '../users/user.service';
import { CreateBookDto } from './dtos/CreateBookDto';
import { User } from '../users/user.entity';
import { UpdateBookDto } from './dtos/UpdateBookDto';

@Injectable()
export class BooksService {
  constructor(
    private usersService: UserService,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
  ) {}

  getPublicBooks(limit: number, page: number) {
    return this.bookRepository.find({
      take: limit,
      where: { privacy: Privacy.PUBLIC },
    });
  }

  getUserBooks(userId: string) {
    return this.bookRepository.find({
      where: { ownerId: userId },
    });
  }

  getBook(bookId: string) {
    return this.bookRepository.findOne({ where: { id: bookId } });
  }

  createBook(createBookDto: CreateBookDto, user: User) {
    const book = new Book();
    book.name = createBookDto.name;
    book.description = createBookDto.description;
    book.ownerId = user.id;
    book.privacy = createBookDto.privacy;
    book.pages = 0;
    //book.pages = createBookDto.pages;
    book.language = createBookDto.language;
    return this.bookRepository.save(book);
  }

  async updateBook(bookId: string, updateBookDto: UpdateBookDto) {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (updateBookDto.name) book.name = updateBookDto.name;
    if (updateBookDto.privacy) book.privacy = updateBookDto.privacy;
    if (updateBookDto.description) book.description = updateBookDto.description;
    if (updateBookDto.language) book.language = updateBookDto.language;
    this.bookRepository.save(book);
    return book;
  }

  async deleteBook(book) {
    /**
     * TODO: delete book entity, and file entity associated with and the drive files (cover + file) associated with this book
     */
    return await this.bookRepository.remove(book);
  }
}
