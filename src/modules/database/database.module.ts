import { Module } from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from '../configuration/configuration.module';
import { Auth } from '../auth/auth.entity';
import { Book } from '../books/book.entity';
import { Note } from '../notes/note.entity';
import { File } from '../files/file.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [Auth, User, Book, File, Note],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
