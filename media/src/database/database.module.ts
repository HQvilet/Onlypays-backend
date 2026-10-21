import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from '../schemas/index.js';

const FEATURE_MODELS = [
  { name: MediaAsset.name, schema: MediaAssetSchema },
];

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature(FEATURE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
