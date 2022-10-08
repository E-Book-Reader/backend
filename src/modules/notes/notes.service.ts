import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private noteRepository: Repository<Note>,
  ) {}

  async saveNote(content: string, page: number, book: Book) {
    const note =
      (await this.noteRepository.findOne({
        where: { bookId: book.id, page },
      })) || new Note();
    note.content = content;
    note.bookId = book.id;
    note.page = page;
    return this.noteRepository.save(note);
  }
}
