import { Prisma, User } from "../generated/prisma/client.js";

export type CreateUserInput = Prisma.UserUncheckedCreateInput;
export type UpdateUserInput = Prisma.UserUncheckedUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type { User };
