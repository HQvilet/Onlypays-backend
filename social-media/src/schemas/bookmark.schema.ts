import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export type BookmarkDocument = HydratedDocument<Bookmark>;

@Schema({
  ...defaultSchemaOptions,
  collection: 'bookmarks',
})
export class Bookmark {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Post UUID being bookmarked.
   */
  @Prop({ type: String, required: true })
  postId: string;

  /**
   * Auth0 user ID of the user bookmarking the post.
   */
  @Prop({ type: String, required: true })
  userId: string;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// Unique compound index enforces at most one bookmark per user per post
BookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Query index for GET /api/bookmarks/me sorted by recent bookmarks
BookmarkSchema.index({ userId: 1, createdAt: -1 });
