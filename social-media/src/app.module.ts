import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { EngagementModule } from './modules/engagement/engagement.module.js';
import { TiersModule } from './modules/tiers/tiers.module.js';
import { MarketplaceModule } from './modules/marketplace/marketplace.module.js';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PostsModule,
    EngagementModule,
    TiersModule,
    MarketplaceModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
