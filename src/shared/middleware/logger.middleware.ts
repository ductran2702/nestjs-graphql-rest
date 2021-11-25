import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  use(req: any, res: any, next: () => void) {
    console.time('Request-Response time');

    res.on('finish', () => console.timeEnd('Request-Response time'));
    next();
  }
}
