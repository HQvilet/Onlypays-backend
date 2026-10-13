import type { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Request body / param / query shapes
// ---------------------------------------------------------------------------

/** Body of POST /api/users/webhook (or POST /api/users) */
export interface CreateUserWebhookBody {
    /** Primary Auth0 user ID (accepts id, userId, or sub) */
    id?: string;
    userId?: string;
    sub?: string;

    /** Unique email */
    email: string;

    /** Unique handle / username (accepts username or nickname) */
    username?: string;
    nickname?: string;

    /** Display name (accepts displayName or name) */
    displayName?: string;
    name?: string;

    /** Profile pictures / URLs (accepts avatarUrl or picture) */
    avatarUrl?: string;
    picture?: string;

    /** Optional banner image URL */
    bannerUrl?: string;

    /** Optional bio text */
    bio?: string;

    /** Role: SUBSCRIBER | CREATOR | ADMIN (defaults to SUBSCRIBER) */
    role?: Role;
}

/** Body of PATCH /api/users/me */
export interface UpdateUserProfileBody {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
}

/** Route params for /api/users/:id */
export interface UserIdParam {
    [key: string]: string;
    id: string;
}

/** Route params for /api/users/username/:username */
export interface UsernameParam {
    [key: string]: string;
    username: string;
}

// ---------------------------------------------------------------------------
// Service-layer DTOs
// ---------------------------------------------------------------------------

/** The safe public view of a User record (no sensitive fields). */
export interface UserProfileDto {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    role: Role;
    isVerified: boolean;
    createdAt: Date;
}

/** Result returned after processing a webhook user creation request. */
export interface CreateUserResult {
    user: UserProfileDto;
    created: boolean;
}

/** Internal type used to identify the calling user from gateway headers. */
export interface AuthenticatedUser {
    userId: string;
    roles: string[];
}
