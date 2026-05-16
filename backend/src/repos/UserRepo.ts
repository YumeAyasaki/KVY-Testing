import { Prisma, User } from '../../generated/prisma/client';
import db from './BaseRepo';

export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;

async function getAll(): Promise<User[]> {
  return db.user.findMany();
}

async function getOne(id: string): Promise<User | null> {
  return db.user.findUnique({
    where: { id },
  });
}

async function getByUsername(username: string): Promise<User | null> {
  return db.user.findFirst({
    where: { username },
  });
}

async function persists(id: string): Promise<boolean> {
  return (await getOne(id)) !== null;
}

async function add(data: UserCreateInput): Promise<User> {
  return db.user.create({
    data,
  });
}

async function update(id: string, data: UserUpdateInput): Promise<User> {
  return db.user.update({
    where: { id },
    data,
  });
}

async function delete_(id: string): Promise<User> {
  return db.user.delete({
    where: { id },
  });
}

export default {
  getAll,
  getOne,
  getByUsername,
  persists,
  add,
  update,
  delete: delete_,
} as const;
