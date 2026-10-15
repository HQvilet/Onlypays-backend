import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
  ...defaultSchemaOptions,
  collection: 'comments',
})
export class Comment {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Post UUID this comment belongs to.
   */
  @Prop({ type: String, required: true, index: true })
  postId: string;

  /**
   * Auth0 user ID of the comment author.
   */
  @Prop({ type: String, required: true, index: true })
  authorId: string;

  /**
   * Comment text content.
   */
  @Prop({ type: String, required: true, maxlength: 1000, trim: true })
  content: string;

  /**
   * Optional parent comment UUID for threaded replies.
   */
  @Prop({ type: String, default: null, index: true })
  parentCommentId: string | null;

  /**
   * Engagement counter for likes on this comment.
   */
  @Prop({ type: Number, default: 0, min: 0 })
  likeCount: number;

  /**
   * Soft-deletion timestamp.
   */
  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Compound index for querying post comments and threaded replies
CommentSchema.index({ postId: 1, parentCommentId: 1, deletedAt: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });
