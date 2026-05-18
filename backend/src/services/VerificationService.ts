import DocumentRepo, { DocumentCreateInput, DocumentUpdateInput } from '@src/repos/DocumentRepo';
import VerificationAttemptRepo, {
  VerificationAttemptCreateInput,
} from '@src/repos/VerificationAttemptRepo';
import Queue from '@src/common/pgBoss';

async function getAllDocuments() {
  return DocumentRepo.getAll();
}

async function getDocument(id: string) {
  return DocumentRepo.getOne(id);
}

async function updateDocument(id: string, data: DocumentUpdateInput) {
  return DocumentRepo.update(id, data);
}

async function addDocument(data: DocumentCreateInput) {
  const document = await DocumentRepo.add(data);

  await Queue.publishVerificationJob(document.id);

  return document;
}

async function getDocumentsBySellerId(sellerId: string) {
  return DocumentRepo.getBySellerId(sellerId);
}

async function addVerificationAttempt(data: VerificationAttemptCreateInput) {
  return VerificationAttemptRepo.add(data);
}

async function getAttemptsByDocument(documentId: string) {
  return VerificationAttemptRepo.getByDocumentId(documentId);
}

export default {
  getAllDocuments,
  getDocument,
  updateDocument,
  addDocument,
  addVerificationAttempt,
  getAttemptsByDocument,
  getDocumentsBySellerId,
} as const;
