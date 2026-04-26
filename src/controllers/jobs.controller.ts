import { Request, Response } from "express";
import {
  createJob,
  filterJobs,
  softDeleteJob,
  updateJob,
} from "../services/jobs.service.js";
import { prisma } from "../lib/prisma.js";
import { FilterJobQuery } from "../validators/job.validator.js";
type Params = {
  id: string;
};

// add new job
export const addJob = async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const job = {
    ...req.body, // validated by Zod
    userId, // injected by server
  };
  const jobDB = await createJob(job);
  res.status(201).json(jobDB);
};
//edit job
export const editJob = async (req: Request<Params>, res: Response) => {
  const { id: jobId } = req.params;
  const job = {
    ...req.body, // validated by Zod
  };

  const updatedJob = await updateJob(jobId, job);
  res.json(updatedJob);
};

//soft delete
export const deleteJob = async (req: Request<Params>, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  const deletedJob = await softDeleteJob(jobId, userId);
  res.json(deletedJob);
};

//filter jobs
export const getJobs = async (
  req: Request<{}, {}, {}, FilterJobQuery>,
  res: Response,
) => {
  const { company, status, source, q } = req.query;
  const userId = req.user.userId;
  const jobs = await filterJobs({
    userId,
    company,
    status,
    source,
    q,
  });

  res.json(jobs);
};

//seed dummy data
export const seedJobsForUser = async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const jobs = [
    {
      userId,
      company: "Google",
      title: "Frontend Engineer",
      status: "APPLIED",
      source: "MANUAL",
      notes: "Applied via careers page",
    },
    {
      userId,
      company: "Microsoft",
      title: "Software Engineer",
      status: "REJECTED",
      source: "MANUAL",
      notes: "Rejected after OA",
    },
    {
      userId,
      company: "Amazon",
      title: "SDE I",
      status: "INTERVIEW_SCHEDULED",
      source: "GMAIL_AUTO",
      emailMessageId: `msg-${userId}-demo`,
      emailThreadId: `thread-${userId}-demo`,
      emailSubject: "Your application at Amazon",
    },
  ];

  await prisma.job.createMany({
    data: jobs,
    skipDuplicates: true, // 👈 important
  });

  res.status(201).json({ message: "Dummy jobs added" });
};
//delete all job data
export const deleteAllJobDataOfUser = async (req: Request, res: Response) => {
  const userId = req.user.userId;

  await prisma.job.deleteMany({ where: { userId } });
  res.json({ message: "All Jobs Data Deleted" });
};
