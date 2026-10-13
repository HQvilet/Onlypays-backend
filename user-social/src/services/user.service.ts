import { prisma } from "../db/client.js";
import { Role } from "@prisma/client";
import type {
    CreateUserResult,
    CreateUserWebhookBody,
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
 * Creates or retrieves a user from an incoming webhook (e.g. Auth0 Action on post-registration/login).
 * Idempotent: If user already exists with the given ID, returns the existing record without failing.
 *
 * @throws Error("INVALID_USER_ID") if required user ID (id/userId/sub) is missing.
 * @throws Error("INVALID_EMAIL") if email is missing or malformed.
 * @throws Error("EMAIL_TAKEN") if email already belongs to a different user ID.
 * @throws Error("USERNAME_TAKEN") if explicitly requested username is already registered.
 */
export async function createUser(
    body: CreateUserWebhookBody,
): Promise<CreateUserResult> {
    const rawId = body.id || body.userId || body.sub;
    if (!rawId || typeof rawId !== "string" || rawId.trim().length === 0) {
        throw new Error("INVALID_USER_ID");
    }
    const id = rawId.trim();

    const rawEmail = body.email;
    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
        throw new Error("INVALID_EMAIL");
    }
    const email = rawEmail.toLowerCase().trim();

    // Idempotency: Return existing user if this Auth0 ID is already provisioned
    const existingById = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    });

    if (existingById) {
        return { user: mapToDto(existingById), created: false };
    }

    // Check if email already belongs to another user
    const existingByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingByEmail) {
        throw new Error("EMAIL_TAKEN");
    }

    // Resolve displayName
    const displayName = (
        body.displayName ||
        body.name ||
        body.nickname ||
        body.username ||
        email.split("@")[0] ||
        "User"
    ).trim();

    // Resolve username
    let rawUsername = (
        body.username ||
        body.nickname ||
        email.split("@")[0] ||
        `user_${Date.now()}`
    )
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "_");

    if (rawUsername.length === 0) {
        rawUsername = `user_${Date.now()}`;
    }

    let username = rawUsername.slice(0, 50);

    // Check if username is already taken
    const existingByUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (existingByUsername) {
        if (body.username) {
            throw new Error("USERNAME_TAKEN");
        }
        // Auto-derived username collision: generate unique suffix
        const suffix = Math.random().toString(36).substring(2, 7);
        username = `${username.slice(0, 43)}_${suffix}`;
    }

    // Resolve role
    let role: Role = Role.SUBSCRIBER;
    if (body.role && Object.values(Role).includes(body.role)) {
        role = body.role;
    }

    const avatarUrl = body.avatarUrl || body.picture || null;
    const bannerUrl = body.bannerUrl || null;
    const bio = body.bio || null;

    const newUser = await prisma.user.create({
        data: {
            id,
            email,
            username,
            displayName,
            avatarUrl,
            bannerUrl,
            bio,
            role,
        },
        select: userSelect,
    });

    return { user: mapToDto(newUser), created: true };
}

/**
 * Returns the profile of the currently authenticated user.
 * Looks up the User record by the primary user ID (Auth0 userId).
 *
 * @throws Error with message "USER_NOT_FOUND" when no record exists.
 */
export async function getAuthenticatedUserProfile(
    userId: string,
): Promise<UserProfileDto> {
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
 * Returns a user's public profile by primary user ID (Auth0 userId).
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
    userId: string,
    body: UpdateUserProfileBody,
): Promise<UserProfileDto> {
    const existing = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true },
    });

    if (!existing) {
        throw new Error("USER_NOT_FOUND");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
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
