import { Controller } from '@nestjs/common';
import { MediaService } from './media.service.js';

/**
 * MediaController exposes the HTTP API for media asset lifecycle management.
 * Endpoints will be implemented in the next phase.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
}
