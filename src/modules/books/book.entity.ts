import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { File } from '../files/file.entity';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import Language from './enums/Langauge';

export enum Privacy {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  ownerId: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.English,
  })
  language: Language;

  @Column()
  pages: number;

  @Column({
    type: 'enum',
    enum: Privacy,
    default: Privacy.PRIVATE,
  })
  privacy: Privacy;

  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  @JoinColumn({
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'ownerId',
  })
  owner: User;

  /*
  TODO: disable eager and know how to fetch it manually
  */

  @OneToMany(() => Note, (note) => note.book)
  @JoinColumn({
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'bookId',
  })
  notes: Promise<Note[]>;

  @OneToOne(() => File, (file) => file.book)
  file: Promise<File>;
}
