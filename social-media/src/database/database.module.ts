import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Post,
  PostSchema,
  SubscriptionTier,
  SubscriptionTierSchema,
  Comment,
  CommentSchema,
  Like,
  LikeSchema,
  Bookmark,
  BookmarkSchema,
  MarketplaceCollection,
  MarketplaceCollectionSchema,
  UserSnapshot,
  UserSnapshotSchema,
} from '../schemas/index.js';

const FEATURE_MODELS = [
  { name: Post.name, schema: PostSchema },
  { name: SubscriptionTier.name, schema: SubscriptionTierSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Like.name, schema: LikeSchema },
  { name: Bookmark.name, schema: BookmarkSchema },
  { name: MarketplaceCollection.name, schema: MarketplaceCollectionSchema },
  { name: UserSnapshot.name, schema: UserSnapshotSchema },
];

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature(FEATURE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
