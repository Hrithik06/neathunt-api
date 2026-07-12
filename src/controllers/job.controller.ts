import { Response } from "express";
import * as jobService from "../services/job.service.js";

// import { prisma } from "../lib/prisma.js";
import { FilterJobQuery } from "../validators/job.validator.js";
// import { JobStatus, JobSource, Currency } from "../types/jobs.js";
import { AuthRequest } from "../types/request.js";

type Params = {
  id: string;
};

// add new job
export const addJob = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const input = req.body;

  const data = {
    ...input, // validated by Zod
    userId, // injected by server
  };
  const jobDB = await jobService.createJob(data);

  res.status(201).json(jobDB);
};
//edit job
// do not apply defaults, only update provided fields
export const editJob = async (req: AuthRequest<Params>, res: Response) => {
  const { id: jobId } = req.params;

  const input = req.body; // validated by Zod

  const data = {
    ...input,
  };
  const updatedJob = await jobService.updateJob(jobId, data);
  res.json(updatedJob);
};

//soft delete
export const deleteJob = async (req: AuthRequest<Params>, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  const deletedJob = await jobService.softDeleteJob(jobId, userId);
  res.json(deletedJob);
};

//filter jobs
export const getJobs = async (
  req: AuthRequest<{}, {}, {}, FilterJobQuery>,
  res: Response,
) => {
  const { company, status, source, q } = req.query;
  const userId = req.user.userId;
  const jobs = await jobService.filterJobs({
    userId,
    company,
    status,
    source,
    q,
  });
  res.json(jobs);
};

//seed dummy data
// export const seedJobsForUser = async (req: AuthRequest, res: Response) => {
//   const userId = req.user.userId;

//   const jobs = [
//     {
//       userId,
//       company: "Google",
//       title: "Frontend Engineer",
//       appliedAt: new Date("2026-05-20").toISOString(),
//       status: JobStatus.APPLIED,
//       source: JobSource.MANUAL,
//       notes: "Applied via careers page",
//       platform: "COMPANY_WEBSITE",
//     },
//     {
//       userId,
//       company: "Microsoft",
//       title: "Software Engineer",
//       appliedAt: new Date("2026-05-20").toISOString(),
//       status: JobStatus.REJECTED,
//       source: JobSource.MANUAL,
//       notes: "Rejected after OA",
//       platform: "REFERRAL",
//       salary: "30-35LPA",
//       currency: Currency.INR,
//     },
//     {
//       userId,
//       company: "Amazon",
//       title: "SDE I",
//       appliedAt: new Date("2026-05-20").toISOString(),
//       status: JobStatus.INTERVIEW_SCHEDULED,
//       source: JobSource.GMAIL_AUTO,
//       emailMessageId: `msg-${userId}-demo`,
//       emailThreadId: `thread-${userId}-demo`,
//       emailSubject: "Your application at Amazon",
//       platform: "LINKEDIN",
//     },
//   ];

//   await prisma.job.createMany({
//     data: jobs,
//     skipDuplicates: true, // 👈 important
//   });

//   res.status(201).json({ message: "Dummy jobs added" });
// };
// DANGEROUS CODE TO BE REMOVED
//delete all job data
// export const deleteAllJobDataOfUser = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   const userId = req.user.userId;

//   await prisma.job.deleteMany({ where: { userId } });
//   res.json({ message: "All Jobs Data Deleted" });
// };
