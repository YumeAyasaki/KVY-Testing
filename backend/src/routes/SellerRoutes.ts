import { isNonEmptyString, isString } from 'jet-validators';
import { parseObject } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import SellerService from '@src/services/SellerService';
import VerificationService from '@src/services/VerificationService';

import { Req, Res } from './common/express-types';
import parseReq from './common/parseReq';

const sellerPayload = parseObject<{ email: string; companyName: string }>({
  email: isNonEmptyString,
  companyName: isNonEmptyString,
});

const sellerUpdatePayload = parseObject<{
  id: string;
  email: string;
  companyName: string;
}>({
  id: isNonEmptyString,
  email: isNonEmptyString,
  companyName: isNonEmptyString,
});

const reqValidators = {
  add: parseReq({ seller: sellerPayload }),
  update: parseReq({ seller: sellerUpdatePayload }),
  delete: parseReq({ id: isString }),
} as const;

async function getAll(_: Req, res: Res) {
  const sellers = await SellerService.getAll();
  res.status(HttpStatusCodes.OK).json({ sellers });
}

async function getDocuments(req: Req, res: Res) {
  const user = (req as any).user as { userId?: string } | undefined;
  const userId = user?.userId;
  if (!userId) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }
  const documents = await VerificationService.getDocumentsBySellerId(userId);
  res.status(HttpStatusCodes.OK).json({ documents });
}

async function addDocument(req: Req, res: Res) {
  const file = (req as Req & { file?: Express.Multer.File }).file;
  const user = (req as any).user as { userId?: string } | undefined;

  console.log(user);
  if (!user?.userId) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  if (!file) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'file is required' });
  }

  const fileUrl = `/uploads/${file.filename}`;

  await VerificationService.addDocument({
    sellerId: user.userId.trim(),
    fileUrl,
    status: 'PENDING_VERIFICATION',
  });

  res.status(HttpStatusCodes.CREATED).json({ fileUrl });
}

async function add(req: Req, res: Res) {
  const { seller } = reqValidators.add(req.body) as {
    seller: { email: string; companyName: string };
  };
  await SellerService.addOne(seller);
  res.status(HttpStatusCodes.CREATED).end();
}

async function update(req: Req, res: Res) {
  const { seller } = reqValidators.update(req.body) as {
    seller: { id: string; email: string; companyName: string };
  };
  const { id, ...data } = seller;
  await SellerService.updateOne(id, data);
  res.status(HttpStatusCodes.OK).end();
}

async function delete_(req: Req, res: Res) {
  const { id } = reqValidators.delete(req.params);
  await SellerService.delete(id);
  res.status(HttpStatusCodes.OK).end();
}

export default {
  getAll,
  add,
  update,
  delete: delete_,
  getDocuments,
  addDocument,
} as const;
