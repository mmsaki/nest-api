import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  counter = 0;
  getHello(): string {
    return 'Hello World!' + this.counter++;
  }
}
