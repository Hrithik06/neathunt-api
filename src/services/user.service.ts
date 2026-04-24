import { prisma } from "../lib/prisma.js";

/*
  Idempotent login:
  First login → create user
  Next 100 logins → return same user
*/
type profileType = {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
  scopes?: string[];
};
export async function findOrCreateUser(profile: profileType) {
  let user = await prisma.user.upsert({
    where: { googleId: profile.googleId },
    update: {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      // scopes: profile.scopes, //not needed conflicts with updateScopes
    },
    create: profile,
  });
  return user;
}
export async function updateScopes(userId: string, scopes: string[]) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });
  // if (!user) {
  //   return null;
  // }
  const mergedScopes = Array.from(
    new Set([...(user.scopes ?? []), ...(scopes ?? [])]),
  );

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      scopes: mergedScopes,
    },
  });
  return updatedUser;
}
export async function enableAutomaticTracking(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { automaticTracking: true },
  });
}

export async function saveGmailTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date,
) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });
  // if (!user) {
  //   return null;
  // }

  const updatedUser = prisma.user.update({
    where: { id: userId },
    data: { accessToken, refreshToken, tokenExpiresAt },
  });
  return updatedUser;
}

export async function getUserByGoogleId(googleId: string) {
  let user = await prisma.user.findUnique({
    where: { googleId },
  });
  if (!user) {
    return null;
  }
  return user;
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
export function getAllUsers() {
  return prisma.user.findMany();
}
