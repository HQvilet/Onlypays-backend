import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import { defaultSchemaOptions } from './common/base.schema.js';

export enum UserRole {
  SUBSCRIBER = 'SUBSCRIBER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}

export type UserSnapshotDocument = HydratedDocument<UserSnapshot>;

/**
 * Local read-model snapshot of user identity and profiles.
 * Synchronized via Kafka events (`user.created`, `user.updated`) from User Service.
 * Eliminates cross-service synchronous REST calls during feed aggregation.
 */
@Schema({
  ...defaultSchemaOptions,
  collection: 'user_snapshots',
})
export class UserSnapshot {
  /**
   * Primary user ID (Auth0 user ID).
   */
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, unique: true, index: true, trim: true })
  username: string;

  @Prop({ type: String, required: true, trim: true })
  displayName: string;

  @Prop({ type: String, default: null })
  avatarUrl: string | null;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.SUBSCRIBER,
    index: true,
  })
  role: UserRole;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
}

export const UserSnapshotSchema = SchemaFactory.createForClass(UserSnapshot);
