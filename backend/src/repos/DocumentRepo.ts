import { Document, DocumentStatus, Prisma } from '../../generated/prisma/client';
import db from './BaseRepo';

type DocumentCreateInput = Prisma.DocumentUncheckedCreateInput;
type DocumentUpdateInput = Prisma.DocumentUncheckedUpdateInput;

type DocumentStatusType = DocumentStatus;

async function getAll(): Promise<Document[]> {
  return db.document.findMany();
}

async function getOne(id: string): Promise<Document | null> {
  return db.document.findUnique({
    where: { id },
  });
}

async function getBySellerId(sellerId: string): Promise<Document[]> {
  return db.document.findMany({
    where: { sellerId },
  });
}

async function getByStatus(status: DocumentStatusType): Promise<Document[]> {
  return db.document.findMany({
    where: { status },
  });
}

async function persists(id: string): Promise<boolean> {
  return (await getOne(id)) !== null;
}

async function add(data: DocumentCreateInput): Promise<Document> {
  return db.document.create({
    data,
  });
}

async function update(id: string, data: DocumentUpdateInput): Promise<Document> {
  return db.document.update({
    where: { id },
    data,
  });
}

async function delete_(id: string): Promise<Document> {
  return db.document.delete({
    where: { id },
  });
}

export default {
  getAll,
  getOne,
  getBySellerId,
  getByStatus,
  persists,
  add,
  update,
  delete: delete_,
} as const;
