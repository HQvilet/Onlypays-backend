import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  type ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUploadResult {
  /** The pre-signed PUT URL the client should upload to directly. */
  uploadUrl: string;
  /** The S3 object key where the file will be stored. */
  storageKey: string;
  /** ISO timestamp when the pre-signed URL expires. */
  expiresAt: Date;
}

export interface HeadObjectResult {
  /** File size in bytes. */
  sizeBytes: number;
  /** Content-Type as stored in S3. */
  contentType: string | undefined;
}

/**
 * StorageService wraps the AWS S3 SDK and provides all object-storage
 * operations needed by the Media Service.
 *
 * All public methods are intentionally thin — they handle SDK interaction
 * and error surfacing, leaving business logic to the calling service.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnBaseUrl: string;
  private readonly presignedUrlTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('S3_REGION', 'ap-southeast-1');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    this.bucket = this.configService.getOrThrow<string>('S3_BUCKET');
    this.cdnBaseUrl = this.configService.getOrThrow<string>('CDN_BASE_URL');
    this.presignedUrlTtlSeconds = this.configService.get<number>(
      'PRESIGNED_URL_TTL_SECONDS',
      900,
    );

    this.s3 = new S3Client({
      region,
      // When S3_ENDPOINT is set (MinIO / local dev), use path-style addressing.
      ...(endpoint
        ? {
            endpoint,
            forcePathStyle: true,
          }
        : {}),
    });
  }

  onModuleInit() {
    this.logger.log(
      `StorageService initialised — bucket: ${this.bucket}, CDN: ${this.cdnBaseUrl}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Pre-signed upload URL
  // ---------------------------------------------------------------------------

  /**
   * Generates a pre-signed S3 PUT URL that allows the client to upload a file
   * directly to object storage without routing through this service.
   *
   * @param storageKey  The full S3 object key (e.g. "user123/IMAGE/uuid/original.jpg")
   * @param mimeType    Content-Type to enforce on the upload (e.g. "image/jpeg")
   * @returns           Upload URL, storage key, and expiry timestamp
   */
  async getPresignedUploadUrl(
    storageKey: string,
    mimeType: string,
  ): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.presignedUrlTtlSeconds,
    });

    const expiresAt = new Date(Date.now() + this.presignedUrlTtlSeconds * 1000);

    this.logger.debug(`Pre-signed URL generated for key: ${storageKey}`);

    return { uploadUrl, storageKey, expiresAt };
  }

  // ---------------------------------------------------------------------------
  // Head / existence check
  // ---------------------------------------------------------------------------

  /**
   * Verifies that an object exists in S3 and retrieves its metadata.
   * Called after the client confirms a successful upload.
   *
   * @param storageKey  The S3 object key to inspect
   * @returns           Object size and content-type, or null if the object does not exist
   */
  async headObject(storageKey: string): Promise<HeadObjectResult | null> {
    try {
      const response = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      );

      return {
        sizeBytes: response.ContentLength ?? 0,
        contentType: response.ContentType,
      };
    } catch (err: unknown) {
      // AWS SDK throws a generic error with $metadata.httpStatusCode === 404
      const statusCode = (err as { $metadata?: { httpStatusCode?: number } })
        ?.$metadata?.httpStatusCode;
      if (statusCode === 404) {
        this.logger.warn(`HeadObject: key not found in S3 — ${storageKey}`);
        return null;
      }
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Delete operations
  // ---------------------------------------------------------------------------

  /**
   * Deletes a single object from S3.
   *
   * @param storageKey  The S3 object key to delete
   */
  async deleteObject(storageKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
    this.logger.debug(`Deleted S3 object: ${storageKey}`);
  }

  /**
   * Deletes multiple objects in a single S3 batch request (max 1000 per call).
   *
   * @param storageKeys  Array of S3 object keys to delete
   */
  async deleteObjects(storageKeys: string[]): Promise<void> {
    if (storageKeys.length === 0) return;

    const objects: ObjectIdentifier[] = storageKeys.map((Key) => ({ Key }));

    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: objects, Quiet: true },
      }),
    );

    this.logger.debug(`Batch-deleted ${storageKeys.length} S3 objects`);
  }

  // ---------------------------------------------------------------------------
  // URL helpers
  // ---------------------------------------------------------------------------

  /**
   * Constructs the public CDN URL for a given S3 object key.
   *
   * @param storageKey  The S3 object key
   * @returns           Full CDN URL (CDN_BASE_URL/{storageKey})
   */
  getPublicUrl(storageKey: string): string {
    return `${this.cdnBaseUrl.replace(/\/$/, '')}/${storageKey}`;
  }

  /**
   * Derives the S3 object key for a processing variant of an asset.
   *
   * @param originalKey  The storage key of the original upload
   * @param variant      The variant name (e.g. "thumbnail", "preview")
   * @param extension    File extension without dot (e.g. "jpg", "webp")
   * @returns            Variant storage key
   *
   * @example
   * getVariantKey("user1/IMAGE/uuid/original.jpg", "thumbnail", "webp")
   * // → "user1/IMAGE/uuid/thumbnail.webp"
   */
  getVariantKey(originalKey: string, variant: string, extension: string): string {
    const directory = originalKey.substring(0, originalKey.lastIndexOf('/'));
    return `${directory}/${variant}.${extension}`;
  }
}
