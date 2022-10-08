import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { File } from 'src/modules/files/file.entity';
import { FilesService } from 'src/modules/files/files.service';

@Injectable()
export default class ParseFilePipe
  implements PipeTransform<string, Promise<File>>
{
  constructor(private filesService: FilesService) {}
  async transform(value: string, metadata: ArgumentMetadata): Promise<File> {
    const fileId = value;
    const file = await this.filesService.getFile({ id: fileId });
    if (!file) throw new NotFoundException('invalid fileId provided');
    return file;
  }
}
