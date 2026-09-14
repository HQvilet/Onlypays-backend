import type { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Request body / param / query shapes
// ---------------------------------------------------------------------------

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

/** Internal type used to identify the calling user from gateway headers. */
export interface AuthenticatedUser {
    userId: string;
    roles: string[];
}
