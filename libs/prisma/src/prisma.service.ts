import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      super({
        log: [
          // { emit: 'event', level: 'query' },
          // { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ],
        errorFormat: 'colorless',
      });
      this.enableQueryLogger();
    } else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
    // this.shimDataType();
  }

  //   async enableShutdownHooks(app: INestApplication) {
  //     this.$on('beforeExit', async () => {
  //       await app.close();
  //     });
  //   }

  async enableQueryLogger() {
    //@ts-ignore
    this.$on('query', (event: any) => {
      Logger.log(
        '\nQuery: ' +
          event.query +
          '\n**** Params: ' +
          event.params +
          '\n**** Duration: ' +
          event.duration +
          'ms',
      );
    });
  }

  // shimDataType() {
  //   // @ts-ignore
  //   BigInt.prototype.toJSON = function () {
  //     return this.toString();
  //   };
  // }
}
