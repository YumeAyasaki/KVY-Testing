import { Prisma, VerificationAttempt } from '../../generated/prisma/client';
import db from './BaseRepo';

export type VerificationAttemptCreateInput =
  Prisma.VerificationAttemptUncheckedCreateInput;
export type VerificationAttemptUpdateInput =
  Prisma.VerificationAttemptUncheckedUpdateInput;

async function getAll(): Promise<VerificationAttempt[]> {
  return db.verificationAttempt.findMany();
}

async function getOne(id: string): Promise<VerificationAttempt | null> {
  return db.verificationAttempt.findUnique({
    where: { id },
  });
}

async function getByDocumentId(
  documentId: string,
): Promise<VerificationAttempt[]> {
  return db.verificationAttempt.findMany({
    where: { documentId },
  });
}

async function persists(id: string): Promise<boolean> {
  return (await getOne(id)) !== null;
}

async function add(
  data: VerificationAttemptCreateInput,
): Promise<VerificationAttempt> {
  return db.verificationAttempt.create({
    data,
  });
}

async function update(
  id: string,
  data: VerificationAttemptUpdateInput,
): Promise<VerificationAttempt> {
  return db.verificationAttempt.update({
    where: { id },
    data,
  });
}

async function delete_(id: string): Promise<VerificationAttempt> {
  return db.verificationAttempt.delete({
    where: { id },
  });
}

export default {
  getAll,
  getOne,
  getByDocumentId,
  persists,
  add,
  update,
  delete: delete_,
} as const;
