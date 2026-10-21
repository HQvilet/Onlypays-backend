import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export type MediaAssetDocument = HydratedDocument<MediaAsset>;

/**
 * The type of binary media asset.
 */
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

/**
 * Lifecycle state machine for a media asset.
 *
 * PENDING_UPLOAD  → PROCESSING  → READY
 *                              → FAILED
 * Any state       → DELETED (soft-delete)
 */
export enum MediaStatus {
  /** Pre-signed upload URL has been issued; file not yet confirmed in storage. */
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  /** Client confirmed upload; transcoding / thumbnail generation is in progress. */
  PROCESSING = 'PROCESSING',
  /** All variants (original, thumbnail, preview) are available in storage. */
  READY = 'READY',
  /** Async processing failed; see processingError for details. */
  FAILED = 'FAILED',
  /** Soft-deleted; file scheduled for removal from object storage. */
  DELETED = 'DELETED',
}

@Schema({
  ...defaultSchemaOptions,
  collection: 'media_assets',
})
export class MediaAsset {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Auth0 user ID of the asset owner / uploader.
   */
  @Prop({ type: String, required: true, index: true })
  ownerId: string;

  /**
   * Category of the binary asset.
   */
  @Prop({ type: String, required: true, enum: Object.values(MediaType) })
  mediaType: MediaType;

  /**
   * Original filename as provided by the client (sanitised, not used for storage).
   */
  @Prop({ type: String, required: true, maxlength: 255 })
  originalFilename: string;

  /**
   * MIME type of the original file (e.g. image/jpeg, video/mp4, audio/mpeg).
   */
  @Prop({ type: String, required: true, maxlength: 100 })
  mimeType: string;

  /**
   * File size in bytes. Populated after upload confirmation via S3 HeadObject.
   */
  @Prop({ type: Number, default: null })
  sizeBytes: number | null;

  /**
   * S3 object key of the original uploaded file.
   * Pattern: {ownerId}/{mediaType}/{mediaId}/original.{ext}
   */
  @Prop({ type: String, required: true })
  storageKey: string;

  /**
   * Public CDN URL of the original file.
   * Null until upload is confirmed and processing completes.
   */
  @Prop({ type: String, default: null })
  originalUrl: string | null;

  /**
   * CDN URL of the generated thumbnail.
   * - IMAGE: resized to max 800px width, quality-optimised JPEG/WebP.
   * - VIDEO: poster frame extracted at the 1-second mark.
   * - AUDIO: null (no visual thumbnail for audio-only assets).
   */
  @Prop({ type: String, default: null })
  thumbnailUrl: string | null;

  /**
   * CDN URL of the gated-content preview variant.
   * - IMAGE: Gaussian-blurred + watermarked version for paywall teaser.
   * - VIDEO: blurred poster frame for paywall teaser.
   * - AUDIO: null.
   * Null for public assets; populated only when the creator marks the asset as gated.
   */
  @Prop({ type: String, default: null })
  previewUrl: string | null;

  /**
   * Image or video width in pixels. Null for audio assets.
   */
  @Prop({ type: Number, default: null })
  width: number | null;

  /**
   * Image or video height in pixels. Null for audio assets.
   */
  @Prop({ type: Number, default: null })
  height: number | null;

  /**
   * Duration in seconds for video and audio assets. Null for images.
   */
  @Prop({ type: Number, default: null })
  durationSeconds: number | null;

  /**
   * Current lifecycle state of the asset.
   */
  @Prop({
    type: String,
    enum: Object.values(MediaStatus),
    default: MediaStatus.PENDING_UPLOAD,
    index: true,
  })
  status: MediaStatus;

  /**
   * ISO timestamp at which the pre-signed upload URL expires.
   * Assets still in PENDING_UPLOAD state past this time are considered stale
   * and eligible for cleanup by a scheduled job.
   */
  @Prop({ type: Date, required: true })
  uploadUrlExpiresAt: Date;

  /**
   * Human-readable error message when status is FAILED.
   * Null in all other states.
   */
  @Prop({ type: String, default: null, maxlength: 1000 })
  processingError: string | null;

  /**
   * Soft-deletion timestamp. Non-null means the asset is logically deleted.
   * The actual S3 objects are removed asynchronously by a cleanup job.
   */
  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

/**
 * Compound index for owner's asset list with cursor-based pagination.
 * Supports: GET /api/media?cursor=...&limit=...
 */
MediaAssetSchema.index({ ownerId: 1, status: 1, deletedAt: 1, createdAt: -1, _id: -1 });

/**
 * Index for the stale-upload cleanup scheduled job.
 * Finds PENDING_UPLOAD assets whose pre-signed URL has expired.
 */
MediaAssetSchema.index({ status: 1, uploadUrlExpiresAt: 1 });
