import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service.js';

// Mock @aws-sdk/s3-request-presigner
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-s3.amazonaws.com/test-bucket/test-key?signature=xyz'),
}));

describe('StorageService', () => {
  let service: StorageService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        if (key === 'S3_REGION') return 'ap-southeast-1';
        if (key === 'S3_ENDPOINT') return undefined;
        if (key === 'PRESIGNED_URL_TTL_SECONDS') return 900;
        return defaultValue;
      }),
      getOrThrow: vi.fn((key: string) => {
        if (key === 'S3_BUCKET') return 'onlypays-media-test';
        if (key === 'CDN_BASE_URL') return 'https://cdn.test.onlypays.com';
        throw new Error(`Missing ${key}`);
      }),
    } as unknown as ConfigService;

    service = new StorageService(configService);
  });

  it('should be defined and initialized', () => {
    expect(service).toBeDefined();
    service.onModuleInit();
  });

  describe('getPublicUrl', () => {
    it('should format public CDN URL properly', () => {
      const url = service.getPublicUrl('user_123/IMAGE/uuid-456/original.jpg');
      expect(url).toBe('https://cdn.test.onlypays.com/user_123/IMAGE/uuid-456/original.jpg');
    });

    it('should strip trailing slash from CDN base url', () => {
      const url = service.getPublicUrl('folder/file.png');
      expect(url).toBe('https://cdn.test.onlypays.com/folder/file.png');
    });
  });

  describe('getVariantKey', () => {
    it('should derive the correct S3 object key for a variant', () => {
      const variantKey = service.getVariantKey(
        'user_123/IMAGE/uuid-456/original.jpg',
        'thumbnail',
        'webp',
      );
      expect(variantKey).toBe('user_123/IMAGE/uuid-456/thumbnail.webp');
    });

    it('should handle preview variants', () => {
      const previewKey = service.getVariantKey(
        'user_123/VIDEO/uuid-789/original.mp4',
        'preview',
        'jpg',
      );
      expect(previewKey).toBe('user_123/VIDEO/uuid-789/preview.jpg');
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should generate pre-signed upload URL with expiry', async () => {
      const result = await service.getPresignedUploadUrl(
        'user_123/IMAGE/uuid-456/original.jpg',
        'image/jpeg',
      );

      expect(result.uploadUrl).toContain('mock-s3.amazonaws.com');
      expect(result.storageKey).toBe('user_123/IMAGE/uuid-456/original.jpg');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('headObject', () => {
    it('should return sizeBytes and contentType when object exists', async () => {
      // Mock s3.send
      (service as any).s3.send = vi.fn().mockResolvedValue({
        ContentLength: 1048576,
        ContentType: 'image/jpeg',
      });

      const result = await service.headObject('user_123/IMAGE/uuid-456/original.jpg');
      expect(result).toEqual({
        sizeBytes: 1048576,
        contentType: 'image/jpeg',
      });
    });

    it('should return null when object does not exist (404)', async () => {
      const error: any = new Error('NoSuchKey');
      error.$metadata = { httpStatusCode: 404 };
      (service as any).s3.send = vi.fn().mockRejectedValue(error);

      const result = await service.headObject('missing-key');
      expect(result).toBeNull();
    });

    it('should rethrow unexpected errors', async () => {
      const error: any = new Error('AccessDenied');
      error.$metadata = { httpStatusCode: 403 };
      (service as any).s3.send = vi.fn().mockRejectedValue(error);

      await expect(service.headObject('forbidden-key')).rejects.toThrow('AccessDenied');
    });
  });

  describe('deleteObject and deleteObjects', () => {
    it('should call delete on s3 client for single object', async () => {
      const sendMock = vi.fn().mockResolvedValue({});
      (service as any).s3.send = sendMock;

      await service.deleteObject('user_123/IMAGE/uuid-456/original.jpg');
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when deleting empty batch', async () => {
      const sendMock = vi.fn().mockResolvedValue({});
      (service as any).s3.send = sendMock;

      await service.deleteObjects([]);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('should batch delete multiple keys', async () => {
      const sendMock = vi.fn().mockResolvedValue({});
      (service as any).s3.send = sendMock;

      await service.deleteObjects(['key1', 'key2']);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });
  });
});
