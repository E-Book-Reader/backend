import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export default class ParseUserPipe
  implements PipeTransform<string, Promise<User>>
{
  constructor(private userService: UserService) {}
  async transform(value: string, metadata: ArgumentMetadata): Promise<User> {
    const userId = value;
    const user = await this.userService.getUser({ id: userId });
    if (!user) throw new NotFoundException('invalid userId provided');
    return user;
  }
}
