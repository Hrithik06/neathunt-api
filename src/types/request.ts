import { Request } from "express";
import core from "express-serve-static-core";
import { JwtPayload } from "./auth.js";

export interface AuthRequest<
  Params = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user: JwtPayload;
}
