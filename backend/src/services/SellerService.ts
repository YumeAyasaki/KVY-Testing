import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import SellerRepo, {
  SellerCreateInput,
  SellerUpdateInput,
} from '@src/repos/SellerRepo';

const Errors = {
  SELLER_NOT_FOUND: 'Seller not found',
} as const;

async function getAll() {
  return SellerRepo.getAll();
}

async function getOne(id: string) {
  const seller = await SellerRepo.getOne(id);
  if (!seller) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SELLER_NOT_FOUND);
  }
  return seller;
}

async function addOne(data: SellerCreateInput) {
  return SellerRepo.add(data);
}

async function updateOne(id: string, data: SellerUpdateInput) {
  const exists = await SellerRepo.persists(id);
  if (!exists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SELLER_NOT_FOUND);
  }
  return SellerRepo.update(id, data);
}

async function deleteOne(id: string) {
  const exists = await SellerRepo.persists(id);
  if (!exists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SELLER_NOT_FOUND);
  }
  return SellerRepo.delete(id);
}

export default {
  Errors,
  getAll,
  getOne,
  addOne,
  updateOne,
  delete: deleteOne,
} as const;
