import { prisma } from "../lib/prisma.js";
const baseWhere = {
  deletedAt: null, //ignore jobs which have value for deletedAt as they are soft deleted
};
export async function findAllJobs(userId: string) {
  const jobs = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      jobs: {
        where: { ...baseWhere },
      },
    },
  });
  return jobs;
}
type jobType = {
  title: string;
  email: string;
  name?: string;
  picture?: string;
  scopes?: string[];
};
export async function findOrCreateJob() {}
