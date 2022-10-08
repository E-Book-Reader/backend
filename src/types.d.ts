import { User } from './modules/users/user.entity';

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
      userId: string;
    }
  }
}
