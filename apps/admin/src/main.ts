import { buildCorsOption } from '@libs/helper/cors';
import { AppErrorsInterceptor } from '@libs/helper/interceptor/errors.interceptor';
import { AppLogger } from '@libs/helper/logger';
import { Sentry } from '@libs/helper/service/sentry.service';
import { PrismaService } from '@libs/prisma';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';

async function bootstrap() {
  // Currently we use Express platform for work with stable apolo graphql
  const logger = new AppLogger();

  const nestAppOpt: NestApplicationOptions = {
    logger: logger,
  };

  const env = process.env.NODE_ENV;
  const app = await NestFactory.create(AdminModule, nestAppOpt);

  const configService = app.get(ConfigService);
  const port = configService.get('ADMIN_PORT');

  app.enableCors(buildCorsOption(configService, logger));

  // handle all app exception
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AppExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new AppErrorsInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  // https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  await app.listen(port).then(() => {
    logger.warn(`🚀 Server ready at :${port} :${env} 🚀`);
    onBootstrapped(app, logger);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
// For HMR
declare const module: any;

function onBootstrapped(app, logger) {
  // Sentry.test();
  Sentry.safeInit(() => {
    logger.log('Sentry was enabled & initialized');
  });
}

bootstrap();
