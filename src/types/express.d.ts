import { JwtPayload } from "./auth.ts";
export { };
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
