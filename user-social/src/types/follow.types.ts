import type { Role } from "@prisma/client";
import type { ParsedQs } from "qs";

// ---------------------------------------------------------------------------
// Service-layer DTOs
// ---------------------------------------------------------------------------

/** Minimal user projection returned in follower/following lists. */
export interface UserSummaryDto {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: Role;
    isVerified: boolean;
}

/** Shape of a persisted follow edge returned after create. */
export interface FollowEdgeDto {
    followerId: string;
    followingId: string;
    createdAt: Date;
}

// ---------------------------------------------------------------------------
// Request param / query shapes
// ---------------------------------------------------------------------------

/** Route params for /api/follows/:targetUserId */
export interface TargetUserIdParam {
    [key: string]: string;
    targetUserId: string;
}

/** Route params for /api/follows/:userId/followers|following */
export interface UserIdParam {
    [key: string]: string;
    userId: string;
}

/** Query params for paginated follow lists */
export interface FollowPaginationQuery extends ParsedQs {
    cursor?: string;
    limit?: string;
}
