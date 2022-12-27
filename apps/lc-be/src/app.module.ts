import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@libs/prisma';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from '@libs/helper/email';
import { TasksModule } from './tasks/tasks.module';
import { PubsubModule } from '@libs/pubsub';
import { NotificationModule } from '@libs/notification';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 2,
    }),
    CacheModule.register({ isGlobal: true, ttl: 5 * 60 }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        debug: configService.get('NODE_ENV') !== 'production',
        playground: true, // always true for admin, front-end not allowed to use,
        introspection: true, // always true for admin, front-end not allowed to use,
        autoSchemaFile: process.cwd() + '/apps/luc-be/src/schema.gql',
        dateScalarMode: 'date',
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': false,
        },
      }),
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UserModule,
    TasksModule,
    PubsubModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
