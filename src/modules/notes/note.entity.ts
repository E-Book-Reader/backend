import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../books/book.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  page: number;

  @Column()
  content: string;

  @Column()
  bookId: string;

  @ManyToOne(() => Book, (book) => book.notes, { onDelete: 'CASCADE' })
  book: Book;
}
