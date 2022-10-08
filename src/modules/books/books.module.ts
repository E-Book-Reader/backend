import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { AuthModule } from '../auth/auth.module';
import { ApiModule } from '../api/api.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    AuthModule,
    FilesModule,
    ApiModule,
    UsersModule,
    TypeOrmModule.forFeature([Book]),
  ],
  controllers: [BooksController],
  exports: [BooksService],
  providers: [BooksService],
})
export class BooksModule {}
