import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule, Module, UnauthorizedException } from '@nestjs/common';
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
import { InvestModule } from './invest/invest.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 2,
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService],
      useFactory: async (configService: ConfigService, authService: AuthService) => ({
        debug: configService.get('NODE_ENV') !== 'production',
        playground: true, // always true for admin, front-end not allowed to use,
        introspection: true, // always true for admin, front-end not allowed to use,
        autoSchemaFile: process.cwd() + '/apps/lc-be/src/schema.gql',
        dateScalarMode: 'date',
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context) => {
              const { connectionParams, extra } = context;
              const authorization = connectionParams?.['authorization'] as any;
              if (!authorization) {
                throw new UnauthorizedException({
                  statusCode: 401,
                  message: 'Access token is required!',
                });
              }

              const payloadJwt = await authService.getJwtPayload(authorization);

              if (!payloadJwt) {
                throw new UnauthorizedException({
                  statusCode: 401,
                  message: 'Access token is required!',
                });
              }

              (extra as any).user = {
                id: payloadJwt.id,
                role: payloadJwt.role,
              };
            },
          },
        },

        context: ({ req, res, connection, extra }) => {
          return { req, res, connection, extra };
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
    InvestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
