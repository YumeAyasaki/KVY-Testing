import { isNonEmptyString, isString } from 'jet-validators';
import { parseObject, Schema, testObject } from 'jet-validators/utils';

import { DocumentStatus } from '../../generated/prisma/client';

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

export interface IDocument {
  id?: string;
  sellerId: string;
  fileUrl: string;
  status?: DocumentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const GetDefaults = (): IDocument => ({
  sellerId: '',
  fileUrl: '',
  status: DocumentStatus.PENDING_UPLOAD,
});

const schema: Schema<IDocument> = {
  sellerId: isString,
  fileUrl: isString,
  status: (value: unknown): value is DocumentStatus | undefined =>
    typeof value === 'undefined' || isDocumentStatus(value),
};

const parseDocument = parseObject<IDocument>(schema);

const isCompleteDocument = testObject<IDocument>({
  sellerId: isNonEmptyString,
  fileUrl: isNonEmptyString,
  status: (value: unknown): value is DocumentStatus | undefined =>
    typeof value === 'undefined' || isDocumentStatus(value),
});

function new_(document?: Partial<IDocument>): IDocument {
  return parseDocument({ ...GetDefaults(), ...document }, (errors) => {
    throw new Error(
      'Setup new document failed ' + JSON.stringify(errors, null, 2),
    );
  });
}

export default {
  new: new_,
  isComplete: isCompleteDocument,
} as const;
