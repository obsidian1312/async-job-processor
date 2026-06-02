import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './modules/events/events.module';
import { ConcurrencyService } from './modules/concurrency/concurrency.service';
import { ConcurrencyModule } from './modules/concurrency/concurrency.module';
import { ConcurrencyService } from './modules/concurrency/concurrency.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI!),
    EventsModule,
    ConcurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConcurrencyService],
})
export class AppModule {}
