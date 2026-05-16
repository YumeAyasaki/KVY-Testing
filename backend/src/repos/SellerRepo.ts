import { Prisma, Seller } from '../../generated/prisma/client';
import db from './BaseRepo';

type SellerCreateInput = Prisma.SellerCreateInput;
type SellerUpdateInput = Prisma.SellerUpdateInput;

async function getAll(): Promise<Seller[]> {
  return db.seller.findMany();
}

async function getOne(id: string): Promise<Seller | null> {
  return db.seller.findUnique({
    where: { id },
  });
}

async function getByEmail(email: string): Promise<Seller | null> {
  return db.seller.findUnique({
    where: { email },
  });
}

async function persists(id: string): Promise<boolean> {
  return (await getOne(id)) !== null;
}

async function add(data: SellerCreateInput): Promise<Seller> {
  return db.seller.create({
    data,
  });
}

async function update(id: string, data: SellerUpdateInput): Promise<Seller> {
  return db.seller.update({
    where: { id },
    data,
  });
}

async function delete_(id: string): Promise<Seller> {
  return db.seller.delete({
    where: { id },
  });
}

export default {
  getAll,
  getOne,
  getByEmail,
  persists,
  add,
  update,
  delete: delete_,
} as const;
