import { prisma } from "../db/client.js";
import type {
    UpdateUserProfileBody,
    UserProfileDto,
} from "../types/user.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prisma select shape used consistently for safe public user projections. */
const userSelect = {
    id: true,
    username: true,
    displayName: true,
    bio: true,
    avatarUrl: true,
    bannerUrl: true,
    role: true,
    isVerified: true,
    createdAt: true,
} as const;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Returns the profile of the currently authenticated user.
 * Looks up the internal User record by the Auth0 sub claim forwarded
 * as the `X-User-Id` gateway header.
 *
 * @throws Error with message "USER_NOT_FOUND" when no record exists.
 */
export async function getAuthenticatedUserProfile(
    auth0UserId: string,
): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: userSelect,
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return mapToDto(user);
}

/**
 * Returns a user's public profile by internal UUID.
 *
 * @throws Error with message "USER_NOT_FOUND" when no record exists.
 */
export async function getUserProfileById(userId: string): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: userSelect,
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return mapToDto(user);
}

/**
 * Returns a user's public profile by username (case-sensitive).
 *
 * @throws Error with message "USER_NOT_FOUND" when no record exists.
 */
export async function getUserProfileByUsername(
    username: string,
): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
        where: { username, deletedAt: null },
        select: userSelect,
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return mapToDto(user);
}

/**
 * Updates mutable profile fields for the authenticated user.
 * Only the fields provided in the body are changed (partial update).
 *
 * @throws Error with message "USER_NOT_FOUND" when no record exists.
 */
export async function updateUserProfile(
    auth0UserId: string,
    body: UpdateUserProfileBody,
): Promise<UserProfileDto> {
    const existing = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: { id: true },
    });

    if (!existing) {
        throw new Error("USER_NOT_FOUND");
    }

    const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
            ...(body.displayName !== undefined && { displayName: body.displayName }),
            ...(body.bio !== undefined && { bio: body.bio }),
            ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
            ...(body.bannerUrl !== undefined && { bannerUrl: body.bannerUrl }),
        },
        select: userSelect,
    });

    return mapToDto(updated);
}

// ---------------------------------------------------------------------------
// Private mappers
// ---------------------------------------------------------------------------

function mapToDto(
    user: {
        id: string;
        username: string;
        displayName: string;
        bio: string | null;
        avatarUrl: string | null;
        bannerUrl: string | null;
        role: UserProfileDto["role"];
        isVerified: boolean;
        createdAt: Date;
    },
): UserProfileDto {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
    };
}
