import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from '../books/book.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  coverId: string;

  @Column()
  bookId: string;

  @OneToOne(() => Book, (book) => book.file, { onDelete: 'CASCADE' })
  @JoinColumn()
  book: Book;
}
