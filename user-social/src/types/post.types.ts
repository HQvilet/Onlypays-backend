import type { PostVisibility, PostStatus, MediaType } from "@prisma/client";
import type { ParsedQs } from "qs";

// ---------------------------------------------------------------------------
// Request body / param / query shapes
// ---------------------------------------------------------------------------

/** Attachment item inside CreatePostBody */
export interface PostAttachmentInput {
    mediaId: string;
    mediaType: MediaType;
    previewUrl?: string;
    displayOrder?: number;
}

/** Body of POST /api/posts */
export interface CreatePostBody {
    caption?: string;
    visibility?: PostVisibility;
    /** UUID of the required subscription tier (for TIER_LOCKED posts) */
    requiredTierId?: string;
    /** Price in Opx integer units (for PAY_PER_VIEW posts) */
    priceOpx?: string;
    status?: PostStatus;
    attachments?: PostAttachmentInput[];
}

/** Body of PUT /api/posts/:id */
export interface UpdatePostBody {
    caption?: string;
    visibility?: PostVisibility;
    requiredTierId?: string | null;
    priceOpx?: string | null;
    status?: PostStatus;
}

/** Route params for /api/posts/:id */
export interface PostIdParam {
    [key: string]: string;
    id: string;
}

/** Route params for /api/posts/creator/:creatorId */
export interface CreatorIdParam {
    [key: string]: string;
    creatorId: string;
}

/** Query params for paginated list endpoints */
export interface PaginationQuery extends ParsedQs {
    cursor?: string;
    limit?: string;
}

// ---------------------------------------------------------------------------
// Service-layer DTOs
// ---------------------------------------------------------------------------

export interface PostAttachmentDto {
    id: string;
    mediaId: string;
    mediaType: MediaType;
    previewUrl: string | null;
    displayOrder: number;
}

export interface PostDto {
    id: string;
    creatorId: string;
    caption: string | null;
    visibility: PostVisibility;
    requiredTierId: string | null;
    priceOpx: string | null;
    status: PostStatus;
    likeCount: number;
    commentCount: number;
    bookmarkCount: number;
    attachments: PostAttachmentDto[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedPostsDto {
    data: PostDto[];
    nextCursor: string | null;
}
