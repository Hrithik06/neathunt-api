import { Request, Response } from "express";
import {
  createJob,
  findAllJobs,
  softDeleteJob,
} from "../services/jobs.service.js";
import { prisma } from "../lib/prisma.js";
type Params = {
  id: string;
};
export const getAllJobs = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const allJobs = await findAllJobs(userId);
  res.json(allJobs);
};
export const addJob = async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const job = {
    ...req.body, // validated by Zod
    userId, // injected by server
  };

  const jobDB = await createJob(job);

  res.json(jobDB);
};
export const editJob = async (req: Request<Params>, res: Response) => {
  const { id } = req.params;
  console.log(id);
  res.json({ id });
};
export const deleteJob = async (req: Request<Params>, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  const deletedJob = await softDeleteJob(jobId, userId);
  res.json({ ...deletedJob });
};
export const filterJobs = async (req: Request, res: Response) => {
  const query = req.query.q;
  console.log(query);
  res.json({ query });
};
export const seedJobsForUser = async (req: Request, res: Response) => {
  console.log("seedJobsForUser");
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

  res.json({ message: "Dummy jobs added" });
};
export const deleteAllJobDataOfUser = async (req: Request, res: Response) => {
  console.log("deleteAllJobDataOfUser");
  const userId = req.user.userId;

  await prisma.job.deleteMany({ where: { userId } });
  res.json({ message: "All Jobs Data Deleted" });
};
