import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { Book } from '../books/book.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  picture: string;

  /*
  TODO: disable eager and know how to fetch it manually
  */

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Promise<Auth>;

  @OneToMany(() => Book, (book) => book.owner)
  books: Promise<Book[]>;
}
