import { buildCorsOption } from '@libs/helper/cors';
import { AppErrorsInterceptor } from '@libs/helper/interceptor/errors.interceptor';
import { AppLogger } from '@libs/helper/logger';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new AppLogger();

  const env = process.env.NODE_ENV;
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.enableCors(buildCorsOption(configService, logger));

  // handle all app exception
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AppExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new AppErrorsInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port).then(() => {
    logger.warn(`🚀 Server ready at :${port} :${env} 🚀`);
    onBootstrapped();
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

// For HMR
declare const module: any;

function onBootstrapped() {
  // Sentry.test();
  // Sentry.safeInit(() => {
  //   logger.log('Sentry was enabled & initialized');
  // });
}

bootstrap();
