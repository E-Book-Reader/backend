import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { File } from './file.entity';
import { FilesApi } from './files.api';
import { FilesController } from './files.controller';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => BooksModule),
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([File]),
  ],
  exports: [FilesService, FilesApi],
  providers: [FilesService, FilesApi],
  controllers: [FilesController],
})
export class FilesModule {}
