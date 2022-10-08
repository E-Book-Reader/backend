import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Book } from 'src/modules/books/book.entity';
import { BooksService } from 'src/modules/books/books.service';

@Injectable()
export default class ParseBookPipe
  implements PipeTransform<string, Promise<Book>>
{
  constructor(private booksService: BooksService) {}
  async transform(value: string, metadata: ArgumentMetadata): Promise<Book> {
    const bookId = value;
    const book = await this.booksService.getBook(bookId);
    if (!book) throw new NotFoundException('invalid bookId provided');
    return book;
  }
}
