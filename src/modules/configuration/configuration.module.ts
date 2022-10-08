import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

/**
 * TODO: add other stuff here, validation and so on
 */

const mode: 'developement' | 'production' = (process.env.MODE ||
  'developement') as 'developement' | 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: [
        `./server.${mode}.env`,
        `./database.${mode}.env`,
        `./google.${mode}.env`,
      ],
    }),
  ],
})
export class ConfigurationModule {}
