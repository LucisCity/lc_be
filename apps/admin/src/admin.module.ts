import { AclModule } from '@libs/helper/acl';
import { PrismaModule } from '@libs/prisma';
import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';

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
        autoSchemaFile: process.cwd() + '/apps/admin/src/schema.gql',
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': false,
        },
        dateScalarMode: 'date',
      }),
    }),
    AclModule,
    PrismaModule,
    ProjectModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
