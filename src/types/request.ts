import { Request } from "express";
import core from "express-serve-static-core"
import { JwtPayload } from "./auth.js";


export interface AuthRequest extends Request {

    user: JwtPayload;
}
