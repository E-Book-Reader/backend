import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import * as Jwt from 'jsonwebtoken';
import JwtPayloadInterface from 'src/interfaces/JwtPayloadInterface';

@Injectable()
export class AuthentifyMiddleware implements NestMiddleware {
  constructor(private configuration: ConfigService) {}
  async use(req: Request, res: Response, next: (error?: any) => void) {
    const token = req.cookies.jwt;
    if (!token) return next();
    const secret = this.configuration.get('server.secret');
    try {
      const payload = Jwt.verify(token, secret) as JwtPayloadInterface;
      const userId = payload.id;
      req.userId = userId;
    } catch {}
    next();
  }
}
