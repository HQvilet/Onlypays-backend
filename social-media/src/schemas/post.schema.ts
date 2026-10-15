import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  SUBSCRIBERS_ONLY = 'SUBSCRIBERS_ONLY',
  TIER_LOCKED = 'TIER_LOCKED',
  PAY_PER_VIEW = 'PAY_PER_VIEW',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export type PostDocument = HydratedDocument<Post>;

@Schema({ _id: false })
export class PostAttachment {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  /**
   * Reference UUID to Media asset in Media Service.
   */
  @Prop({ type: String, required: true })
  mediaId: string;

  @Prop({ type: String, required: true, enum: Object.values(MediaType) })
  mediaType: MediaType;

  /**
   * Lightweight thumbnail or video poster URL for fast feed rendering.
   * Applicable to both public and gated posts for frontend performance.
   */
  @Prop({ type: String, default: null })
  thumbnailUrl: string | null;

  /**
   * Teaser preview URL (e.g. blurred or watermarked image/short clip).
   * Used exclusively for gated posts (SUBSCRIBERS_ONLY, TIER_LOCKED, PAY_PER_VIEW)
   * to show a teaser behind paywall. Not needed or omitted for PUBLIC posts.
   */
  @Prop({ type: String, default: null })
  previewUrl: string | null;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;
}

export const PostAttachmentSchema = SchemaFactory.createForClass(PostAttachment);

@Schema({
  ...defaultSchemaOptions,
  collection: 'posts',
})
export class Post {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Auth0 user ID of the creator.
   */
  @Prop({ type: String, required: true, index: true })
  creatorId: string;

  /**
   * Post caption / narrative.
   */
  @Prop({ type: String, maxlength: 2200, default: null, trim: true })
  caption: string | null;

  /**
   * Visibility access control policy.
   */
  @Prop({
    type: String,
    enum: Object.values(PostVisibility),
    default: PostVisibility.SUBSCRIBERS_ONLY,
    index: true,
  })
  visibility: PostVisibility;

  /**
   * UUID of the required subscription tier if visibility is TIER_LOCKED.
   */
  @Prop({ type: String, default: null, index: true })
  requiredTierId: string | null;

  /**
   * Denormalized minimum tier weight required to view this post.
   * Enables O(1) hierarchical access checks (e.g. userTierWeight >= post.requiredTierWeight)
   * without joining the tier collection during feed hydration.
   */
  @Prop({ type: Number, default: null, index: true })
  requiredTierWeight: number | null;

  /**
   * Price in Opux (Opx) for individual post unlock if visibility is PAY_PER_VIEW.
   */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    default: null,
    get: (v: mongoose.Types.Decimal128) => (v ? v.toString() : null),
  })
  priceOpx: mongoose.Types.Decimal128 | null;

  /**
   * Publication lifecycle status.
   */
  @Prop({
    type: String,
    enum: Object.values(PostStatus),
    default: PostStatus.PUBLISHED,
    index: true,
  })
  status: PostStatus;

  /**
   * Media attachments embedded in this post.
   */
  @Prop({ type: [PostAttachmentSchema], default: [] })
  attachments: PostAttachment[];

  /**
   * Counter caches for engagement performance.
   */
  @Prop({ type: Number, default: 0, min: 0 })
  likeCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  commentCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  bookmarkCount: number;

  /**
   * Soft-deletion timestamp.
   */
  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for feed and creator profile queries with cursor pagination
PostSchema.index({ creatorId: 1, status: 1, deletedAt: 1, createdAt: -1, _id: -1 });
PostSchema.index({ status: 1, visibility: 1, deletedAt: 1, createdAt: -1, _id: -1 });
