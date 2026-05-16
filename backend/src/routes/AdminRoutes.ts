import { isNonEmptyString, isString } from 'jet-validators';
import { parseObject } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import VerificationService from '@src/services/VerificationService';

import { DocumentStatus } from '../../generated/prisma/client';
import { Req, Res } from './common/express-types';
import parseReq from './common/parseReq';

function isDocumentStatus(value: unknown): value is DocumentStatus {
  return (
    value === DocumentStatus.PENDING_UPLOAD ||
    value === DocumentStatus.SUBMITTED ||
    value === DocumentStatus.PENDING_VERIFICATION ||
    value === DocumentStatus.APPROVED ||
    value === DocumentStatus.REJECTED ||
    value === DocumentStatus.INCONCLUSIVE
  );
}

const documentPayload = parseObject<{
  sellerId: string;
  fileUrl: string;
  status?: DocumentStatus;
}>({
  sellerId: isNonEmptyString,
  fileUrl: isNonEmptyString,
  status: (value: unknown): value is DocumentStatus | undefined =>
    typeof value === 'undefined' || isDocumentStatus(value),
});

const documentUpdatePayload = parseObject<{
  id: string;
  fileUrl?: string;
  status?: DocumentStatus;
}>({
  id: isNonEmptyString,
  fileUrl: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  status: (value: unknown): value is DocumentStatus | undefined =>
    typeof value === 'undefined' || isDocumentStatus(value),
});

const verificationAttemptPayload = parseObject<{
  documentId: string;
  providerStatus?: string;
  adminId?: string;
  adminDecision?: string;
  reason?: string;
}>({
  documentId: isNonEmptyString,
  providerStatus: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  adminId: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  adminDecision: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  reason: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
});

const reqValidators = {
  addDocument: parseReq({ document: documentPayload }),
  updateDocument: parseReq({ document: documentUpdatePayload }),
  addAttempt: parseReq({ attempt: verificationAttemptPayload }),
  getByDocument: parseReq({ documentId: isNonEmptyString }),
} as const;

async function getAllDocuments(_: Req, res: Res) {
  const documents = await VerificationService.getAllDocuments();
  res.status(HttpStatusCodes.OK).json({ documents });
}

async function getDocumentById(req: Req, res: Res) {
  const { id } = req.params as { id: string };
  const document = await VerificationService.getDocument(id);
  if (!document) {
    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .json({ error: 'Document not found' });
  }
  res.status(HttpStatusCodes.OK).json({ document });
}

async function updateDocument(req: Req, res: Res) {
  const { document } = reqValidators.updateDocument(req.body) as {
    document: { id: string; fileUrl?: string; status?: DocumentStatus };
  };
  const { id, ...data } = document;
  await VerificationService.updateDocument(id, data);
  res.status(HttpStatusCodes.OK).end();
}

async function addVerificationAttempt(req: Req, res: Res) {
  const { attempt } = reqValidators.addAttempt(req.body) as {
    attempt: {
      documentId: string;
      providerStatus?: string;
      adminId?: string;
      adminDecision?: string;
      reason?: string;
    };
  };
  await VerificationService.addVerificationAttempt(attempt);
  res.status(HttpStatusCodes.CREATED).end();
}

async function getAttemptsByDocument(req: Req, res: Res) {
  const { documentId } = reqValidators.getByDocument(req.params) as {
    documentId: string;
  };
  const attempts = await VerificationService.getAttemptsByDocument(documentId);
  res.status(HttpStatusCodes.OK).json({ attempts });
}

export default {
  getAllDocuments,
  getDocumentById,
  updateDocument,
  addVerificationAttempt,
  getAttemptsByDocument,
} as const;
