import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Privacy } from '../book.entity';
import Language from '../enums/Langauge';

export class UpdateBookDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 64)
  @IsOptional()
  name: string;
  @IsNotEmpty()
  @IsString()
  @Length(1, 2000)
  @IsOptional()
  description: string;
  @IsNotEmpty()
  @IsString()
  @IsEnum(Privacy)
  @IsOptional()
  privacy: Privacy;
  @IsNotEmpty()
  @IsString()
  @IsEnum(Language)
  language: Language;
}
