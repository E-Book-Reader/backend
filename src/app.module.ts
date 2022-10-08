import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApiModule } from './modules/api/api.module';
import { BooksModule } from './modules/books/books.module';

import { AuthentifyMiddleware } from './middlewares/authentify.middleware';
import { NotesModule } from './modules/notes/notes.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    ApiModule,
    BooksModule,
    NotesModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthentifyMiddleware).forRoutes('/**');
  }
}
