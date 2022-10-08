import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Privacy } from '../book.entity';
import Language from '../enums/Langauge';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 64)
  name: string;
  @IsNotEmpty()
  @IsString()
  @Length(1, 2000)
  description: string;
  @IsNotEmpty()
  @IsString()
  @IsEnum(Privacy)
  privacy: Privacy;
  @IsNotEmpty()
  @IsString()
  @IsEnum(Language)
  language: Language;
}
