import { prisma } from "../db/client.js";
import type { FollowEdgeDto, UserSummaryDto } from "../types/follow.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal user projection used in follower/following lists. */
const userSummarySelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    role: true,
    isVerified: true,
} as const;

function mapUserToSummary(user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: UserSummaryDto["role"];
    isVerified: boolean;
}): UserSummaryDto {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
    };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Create a follow edge: `followerId` → `targetUserId`.
 * No-ops if the edge already exists (idempotent).
 *
 * @throws Error("USER_NOT_FOUND")   if either user does not exist.
 * @throws Error("CANNOT_SELF_FOLLOW") if both resolve to the same user.
 */
export async function followUser(
    followerId: string,
    targetUserId: string,
): Promise<FollowEdgeDto> {
    if (followerId === targetUserId) throw new Error("CANNOT_SELF_FOLLOW");

    // Validate the authenticated caller exists.
    const follower = await prisma.user.findUnique({
        where: { id: followerId, deletedAt: null },
        select: { id: true },
    });
    if (!follower) throw new Error("USER_NOT_FOUND");

    // Validate the target exists.
    const target = await prisma.user.findUnique({
        where: { id: targetUserId, deletedAt: null },
        select: { id: true },
    });
    if (!target) throw new Error("USER_NOT_FOUND");

    // Upsert is idempotent — safe to call multiple times.
    const edge = await prisma.follower.upsert({
        where: {
            followerId_followingId: {
                followerId: follower.id,
                followingId: target.id,
            },
        },
        create: {
            followerId: follower.id,
            followingId: target.id,
        },
        update: {}, // already exists — nothing to change
        select: {
            followerId: true,
            followingId: true,
            createdAt: true,
        },
    });

    return edge;
}

/**
 * Delete the follow edge: `followerId` → `targetUserId`.
 * No-ops silently when the edge does not exist.
 *
 * @throws Error("USER_NOT_FOUND") if the authenticated caller does not exist.
 */
export async function unfollowUser(
    followerId: string,
    targetUserId: string,
): Promise<void> {
    const follower = await prisma.user.findUnique({
        where: { id: followerId, deletedAt: null },
        select: { id: true },
    });
    if (!follower) throw new Error("USER_NOT_FOUND");

    await prisma.follower.deleteMany({
        where: {
            followerId: follower.id,
            followingId: targetUserId,
        },
    });
}

/**
 * Returns the list of users who follow `userId` (inbound edges).
 * Cursor-paginated by `createdAt` descending.
 *
 * @throws Error("USER_NOT_FOUND") if `userId` does not exist.
 */
export async function getFollowers(
    userId: string,
    cursor?: string,
    limit = 20,
): Promise<{ data: UserSummaryDto[]; nextCursor: string | null }> {
    const target = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true },
    });
    if (!target) throw new Error("USER_NOT_FOUND");

    const take = Math.min(limit, 50);

    const edges = await prisma.follower.findMany({
        where: { followingId: userId },
        orderBy: { createdAt: "desc" },
        take: take + 1,
        ...(cursor && {
            cursor: {
                followerId_followingId: {
                    followerId: cursor,
                    followingId: userId,
                },
            },
            skip: 1,
        }),
        select: {
            followerId: true,
            follower: { select: userSummarySelect },
        },
    });

    const hasMore = edges.length > take;
    const page = hasMore ? edges.slice(0, take) : edges;
    const nextCursor = hasMore ? page[page.length - 1]!.followerId : null;

    return {
        data: page.map((e: { follower: { id: string; username: string; displayName: string; avatarUrl: string | null; role: UserSummaryDto["role"]; isVerified: boolean } }) => mapUserToSummary(e.follower)),
        nextCursor,
    };
}

/**
 * Returns the list of users that `userId` is following (outbound edges).
 * Cursor-paginated by `createdAt` descending.
 *
 * @throws Error("USER_NOT_FOUND") if `userId` does not exist.
 */
export async function getFollowing(
    userId: string,
    cursor?: string,
    limit = 20,
): Promise<{ data: UserSummaryDto[]; nextCursor: string | null }> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    const take = Math.min(limit, 50);

    const edges = await prisma.follower.findMany({
        where: { followerId: userId },
        orderBy: { createdAt: "desc" },
        take: take + 1,
        ...(cursor && {
            cursor: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: cursor,
                },
            },
            skip: 1,
        }),
        select: {
            followingId: true,
            following: { select: userSummarySelect },
        },
    });

    const hasMore = edges.length > take;
    const page = hasMore ? edges.slice(0, take) : edges;
    const nextCursor = hasMore ? page[page.length - 1]!.followingId : null;

    return {
        data: page.map((e: { following: { id: string; username: string; displayName: string; avatarUrl: string | null; role: UserSummaryDto["role"]; isVerified: boolean } }) => mapUserToSummary(e.following)),
        nextCursor,
    };
}
