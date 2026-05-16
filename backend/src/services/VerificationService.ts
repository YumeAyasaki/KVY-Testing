import DocumentRepo, { DocumentUpdateInput } from '@src/repos/DocumentRepo';
import VerificationAttemptRepo, {
  VerificationAttemptCreateInput,
} from '@src/repos/VerificationAttemptRepo';

async function getAllDocuments() {
  return DocumentRepo.getAll();
}

async function getDocument(id: string) {
  return DocumentRepo.getOne(id);
}

async function updateDocument(id: string, data: DocumentUpdateInput) {
  return DocumentRepo.update(id, data);
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
  addVerificationAttempt,
  getAttemptsByDocument,
} as const;
