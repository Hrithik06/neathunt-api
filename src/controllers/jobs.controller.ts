import { Request, Response } from "express";

export const getJobs = async (req: Request, res: Response) => {
  res.json({ jobs: "hi" });
};
export const addJob = async (req: Request, res: Response) => {
  const job = req.body;
  res.json(job);
};
export const editJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  res.json({ id });
};
export const deleteJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  res.json({ id });
};
