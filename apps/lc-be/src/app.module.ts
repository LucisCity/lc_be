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
import { ImageModule } from './image/image.module';
import { InvestModule } from './invest/invest.module';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionModule } from '@libs/subscription';
import { ErrorCodeModule } from '@libs/helper/error-code/error-code.module';

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
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        debug: configService.get('NODE_ENV') !== 'production',
        playground: true, // always true for admin, front-end not allowed to use,
        introspection: true, // always true for admin, front-end not allowed to use,
        autoSchemaFile: process.cwd() + '/apps/lc-be/src/schema.gql',
        dateScalarMode: 'date',
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              const { connectionParams, extra } = context;
              if (!connectionParams.authorization || connectionParams.authorization.length === 0) {
                return;
              }
              const token = ExtractJwt.fromAuthHeaderAsBearerToken()({
                headers: { authorization: connectionParams.authorization },
              });
              if (!token) {
                return;
              }
              const jwtService = new JwtService({
                secret: configService.get<string>('JWT_SECRET'),
              });
              const payload: { id: string } = jwtService.verify(token);
              if (!payload || !payload.id) {
                throw new Error('Token is not valid');
              }
              context.user = { id: payload.id };
            },
            context: (ctx) => {
              return { user: ctx.user };
            },
          },
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
    SubscriptionModule,
    ImageModule,
    InvestModule,
    ErrorCodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
