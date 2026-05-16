import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { IUser } from '@src/models/User.model';
import UserRepo, {
  UserCreateInput,
  UserUpdateInput,
} from '@src/repos/UserRepo';

const Errors = {
  USER_NOT_FOUND: 'User not found',
} as const;

function getAll(): Promise<IUser[]> {
  return UserRepo.getAll();
}

function addOne(user: IUser): Promise<void> {
  const data: UserCreateInput = {
    username: user.username,
    password: user.password,
    Role: user.role,
  };
  return UserRepo.add(data).then(() => undefined);
}

async function updateOne(user: IUser): Promise<void> {
  if (!user.id) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const persists = await UserRepo.persists(user.id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const data: UserUpdateInput = {
    username: user.username,
    password: user.password,
    Role: user.role,
  };

  await UserRepo.update(user.id, data);
}

async function deleteOne(id: string): Promise<void> {
  const persists = await UserRepo.persists(id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  await UserRepo.delete(id);
}

export default {
  Errors,
  getAll,
  addOne,
  updateOne,
  delete: deleteOne,
} as const;
