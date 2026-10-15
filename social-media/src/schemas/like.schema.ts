import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export type LikeDocument = HydratedDocument<Like>;

@Schema({
  ...defaultSchemaOptions,
  collection: 'likes',
})
export class Like {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Post UUID being liked.
   */
  @Prop({ type: String, required: true })
  postId: string;

  /**
   * Auth0 user ID of the user liking the post.
   */
  @Prop({ type: String, required: true })
  userId: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Unique compound index enforces at most one like per user per post
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Query index for listing user's liked posts
LikeSchema.index({ userId: 1, createdAt: -1 });
