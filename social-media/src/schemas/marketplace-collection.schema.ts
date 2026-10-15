import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';
import { MediaType } from './post.schema.js';

export enum CollectionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export type MarketplaceCollectionDocument = HydratedDocument<MarketplaceCollection>;

@Schema({ _id: false })
export class CollectionItem {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  /**
   * Media asset UUID in Media Service.
   */
  @Prop({ type: String, required: true })
  mediaId: string;

  @Prop({ type: String, required: true, enum: Object.values(MediaType) })
  mediaType: MediaType;

  /**
   * Watermarked or low-res preview URL displayed in marketplace storefront.
   */
  @Prop({ type: String, default: null })
  previewUrl: string | null;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: String, default: null, trim: true })
  title: string | null;
}

export const CollectionItemSchema = SchemaFactory.createForClass(CollectionItem);

@Schema({
  ...defaultSchemaOptions,
  collection: 'marketplace_collections',
})
export class MarketplaceCollection {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Auth0 user ID of the creator selling this collection.
   */
  @Prop({ type: String, required: true, index: true })
  creatorId: string;

  @Prop({ type: String, required: true, maxlength: 150, trim: true })
  title: string;

  @Prop({ type: String, maxlength: 2000, default: null, trim: true })
  description: string | null;

  @Prop({ type: String, required: true })
  coverImageUrl: string;

  /**
   * One-time purchase price denominated in Opux (Opx).
   */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v: mongoose.Types.Decimal128) => (v ? v.toString() : null),
  })
  priceOpx: mongoose.Types.Decimal128;

  @Prop({
    type: String,
    enum: Object.values(CollectionStatus),
    default: CollectionStatus.PUBLISHED,
    index: true,
  })
  status: CollectionStatus;

  /**
   * Media bundle assets included in this collection.
   */
  @Prop({ type: [CollectionItemSchema], default: [] })
  items: CollectionItem[];

  @Prop({ type: Number, default: 0, min: 0 })
  itemCount: number;

  /**
   * Total sales counter for sorting top-performing collections.
   */
  @Prop({ type: Number, default: 0, min: 0, index: true })
  salesCount: number;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const MarketplaceCollectionSchema = SchemaFactory.createForClass(MarketplaceCollection);

// Compound indexes for marketplace storefront queries
MarketplaceCollectionSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
MarketplaceCollectionSchema.index({ status: 1, deletedAt: 1, salesCount: -1 });
MarketplaceCollectionSchema.index({ creatorId: 1, status: 1, deletedAt: 1, createdAt: -1 });
