import { prisma } from "../db/client.js";
import type { Prisma, Post, PostAttachment } from "@prisma/client";
import type {
    CreatePostBody,
    UpdatePostBody,
    PostDto,
    PostAttachmentDto,
    PaginatedPostsDto,
} from "../types/post.types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 50;

// ---------------------------------------------------------------------------
// Shared query shape
// ---------------------------------------------------------------------------

const postSelect = {
    id: true,
    creatorId: true,
    caption: true,
    visibility: true,
    requiredTierId: true,
    priceOpx: true,
    status: true,
    likeCount: true,
    commentCount: true,
    bookmarkCount: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    attachments: {
        select: {
            id: true,
            mediaId: true,
            mediaType: true,
            previewUrl: true,
            displayOrder: true,
        },
        orderBy: { displayOrder: "asc" as const },
    },
} satisfies Prisma.PostSelect;

/** Infer the exact return type that Prisma produces for `postSelect`. */
type SelectedPost = Prisma.PostGetPayload<{ select: typeof postSelect }>;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Creates a new feed post for a creator.
 * The creatorId is the internal UUID resolved from the gateway `X-User-Id` header.
 *
 * @throws Error "CREATOR_NOT_FOUND" when the user record doesn't exist.
 */
export async function createPost(
    auth0UserId: string,
    body: CreatePostBody,
): Promise<PostDto> {
    // Resolve internal user record from Auth0 sub
    const creator = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: { id: true },
    });

    if (!creator) {
        throw new Error("CREATOR_NOT_FOUND");
    }

    const post = await prisma.post.create({
        data: {
            creatorId: creator.id,
            caption: body.caption ?? null,
            visibility: body.visibility ?? "SUBSCRIBERS_ONLY",
            requiredTierId: body.requiredTierId ?? null,
            priceOpx: body.priceOpx ?? null,
            status: body.status ?? "PUBLISHED",
            ...(body.attachments?.length
                ? {
                      attachments: {
                          create: body.attachments.map((a) => ({
                              mediaId: a.mediaId,
                              mediaType: a.mediaType,
                              previewUrl: a.previewUrl ?? null,
                              displayOrder: a.displayOrder ?? 0,
                          })),
                      },
                  }
                : {}),
        },
        select: postSelect,
    });

    return mapPostToDto(post);
}

/**
 * Returns a single post by its UUID. Excludes soft-deleted posts.
 *
 * @throws Error "POST_NOT_FOUND".
 */
export async function getPostById(postId: string): Promise<PostDto> {
    const post = await prisma.post.findUnique({
        where: { id: postId, deletedAt: null },
        select: postSelect,
    });

    if (!post) {
        throw new Error("POST_NOT_FOUND");
    }

    return mapPostToDto(post);
}

/**
 * Updates caption, visibility, tier requirement, price, or status of a post.
 * Only the creator who owns the post may update it.
 *
 * @throws Error "POST_NOT_FOUND" | "FORBIDDEN".
 */
export async function updatePost(
    auth0UserId: string,
    postId: string,
    body: UpdatePostBody,
): Promise<PostDto> {
    const creator = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: { id: true },
    });

    if (!creator) {
        throw new Error("POST_NOT_FOUND");
    }

    const existing = await prisma.post.findUnique({
        where: { id: postId, deletedAt: null },
        select: { id: true, creatorId: true },
    });

    if (!existing) {
        throw new Error("POST_NOT_FOUND");
    }

    if (existing.creatorId !== creator.id) {
        throw new Error("FORBIDDEN");
    }

    const updated = await prisma.post.update({
        where: { id: postId },
        data: {
            ...(body.caption !== undefined && { caption: body.caption }),
            ...(body.visibility !== undefined && { visibility: body.visibility }),
            ...(body.requiredTierId !== undefined && { requiredTierId: body.requiredTierId }),
            ...(body.priceOpx !== undefined && { priceOpx: body.priceOpx }),
            ...(body.status !== undefined && { status: body.status }),
        },
        select: postSelect,
    });

    return mapPostToDto(updated);
}

/**
 * Soft-deletes a post. Only the creator who owns it may delete it.
 *
 * @throws Error "POST_NOT_FOUND" | "FORBIDDEN".
 */
export async function deletePost(
    auth0UserId: string,
    postId: string,
): Promise<void> {
    const creator = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: { id: true },
    });

    if (!creator) {
        throw new Error("POST_NOT_FOUND");
    }

    const existing = await prisma.post.findUnique({
        where: { id: postId, deletedAt: null },
        select: { id: true, creatorId: true },
    });

    if (!existing) {
        throw new Error("POST_NOT_FOUND");
    }

    if (existing.creatorId !== creator.id) {
        throw new Error("FORBIDDEN");
    }

    await prisma.post.update({
        where: { id: postId },
        data: { deletedAt: new Date() },
    });
}

/**
 * Returns a cursor-paginated feed of posts from creators the authenticated
 * user follows.
 */
export async function getFeedPosts(
    auth0UserId: string,
    cursor?: string,
    rawLimit?: string,
): Promise<PaginatedPostsDto> {
    const limit = resolveLimit(rawLimit);

    const viewer = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId },
        select: { id: true },
    });

    if (!viewer) {
        return { data: [], nextCursor: null };
    }

    const followedCreatorIds = await prisma.follow.findMany({
        where: { followerId: viewer.id },
        select: { followingId: true },
    });

    const creatorIds = followedCreatorIds.map((f) => f.followingId);

    const posts = await prisma.post.findMany({
        where: {
            creatorId: { in: creatorIds },
            status: "PUBLISHED",
            deletedAt: null,
        },
        select: postSelect,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return buildPage(posts, limit);
}

/**
 * Returns a cursor-paginated list of published posts by a specific creator.
 */
export async function getCreatorPosts(
    creatorId: string,
    cursor?: string,
    rawLimit?: string,
): Promise<PaginatedPostsDto> {
    const limit = resolveLimit(rawLimit);

    const posts = await prisma.post.findMany({
        where: {
            creatorId,
            status: "PUBLISHED",
            deletedAt: null,
        },
        select: postSelect,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return buildPage(posts, limit);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function resolveLimit(raw: string | undefined): number {
    const parsed = raw !== undefined ? parseInt(raw, 10) : NaN;
    if (isNaN(parsed) || parsed < 1) return DEFAULT_PAGE_LIMIT;
    return Math.min(parsed, MAX_PAGE_LIMIT);
}

function mapPostToDto(post: SelectedPost): PostDto {
    return {
        id: post.id,
        creatorId: post.creatorId,
        caption: post.caption,
        visibility: post.visibility,
        requiredTierId: post.requiredTierId,
        priceOpx: post.priceOpx !== null ? post.priceOpx.toString() : null,
        status: post.status,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        bookmarkCount: post.bookmarkCount,
        attachments: post.attachments.map(
            (a): PostAttachmentDto => ({
                id: a.id,
                mediaId: a.mediaId,
                mediaType: a.mediaType,
                previewUrl: a.previewUrl,
                displayOrder: a.displayOrder,
            }),
        ),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

function buildPage(posts: SelectedPost[], limit: number): PaginatedPostsDto {
    const hasNextPage = posts.length > limit;
    const page = hasNextPage ? posts.slice(0, limit) : posts;
    const lastPost = page[page.length - 1];
    return {
        data: page.map(mapPostToDto),
        nextCursor: hasNextPage && lastPost !== undefined ? lastPost.id : null,
    };
}
