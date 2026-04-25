import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { CreateJobServiceInput, JobWhereInput } from "../types/jobs.js";
const getBaseWhere = (userId: string): JobWhereInput => ({
  userId,
  deletedAt: null, //ignore jobs which have value for deletedAt as they are soft deleted
});

export async function findAllJobs(userId: string) {
  const jobs = await prisma.job.findMany({
    where: getBaseWhere(userId),
  });
  return [...jobs];
}

//For Manual Entry
export async function createJob(data: CreateJobServiceInput) {
  return prisma.job.create({
    data, // matches UncheckedCreateInput
  });
}

//For deleted
//why getBaseWhere here? cuz we dont want to let user soft delete the same job again which will cause update in deletedAt timestamp
export async function softDeleteJob(jobId: string, userId: string) {
  // updateMany returns count instead of throwing if no match (already deleted / not found)
  const result = await prisma.job.updateMany({
    where: {
      id: jobId,
      userId,
      deletedAt: null, // only delete if not already deleted
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // nothing updated → already deleted OR not found
  if (result.count === 0) {
    return { alreadyDeleted: true };
  }

  return { success: true };
}

// //For GMail
// export async function findOrCreateJob(job: CreateJobServiceInput) {
//   if (job.emailMessageId) {
//     return prisma.job.upsert({
//       where: {
//         userId_emailMessageId: {
//           userId: job.userId,
//           emailMessageId: job.emailMessageId,
//         },
//       },
//       update: {}, // don't overwrite
//       create: job,
//     });
//   }

//   // manual job → just create
//   return prisma.job.create({
//     data: job,
//   });
// }
