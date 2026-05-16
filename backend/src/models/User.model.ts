import { isNonEmptyString, isString } from 'jet-validators';
import { parseObject, Schema, testObject } from 'jet-validators/utils';

import { Role } from '../../generated/prisma/client';

/**
 * Validates a Role value.
 */
function isRole(value: unknown): value is Role {
  return value === Role.ADMIN || value === Role.SELLER;
}

/**
 * User model shape aligned with Prisma schema.
 */
export interface IUser {
  id?: string;
  username: string;
  password: string;
  role?: Role;
  createdAt?: Date;
}

const GetDefaults = (): IUser => ({
  username: '',
  password: '',
  role: Role.SELLER,
});

const schema: Schema<IUser> = {
  id: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  username: isString,
  password: isString,
  role: (value: unknown): value is Role | undefined =>
    value === undefined || isRole(value),
  createdAt: (value: unknown): value is Date | undefined =>
    typeof value === 'undefined' || value instanceof Date,
};

// Set the "parseUser" function
const parseUser = parseObject<IUser>(schema);

// For the APIs make sure the right fields are complete
const isCompleteUser = testObject<IUser>({
  id: (value: unknown): value is string | undefined =>
    typeof value === 'undefined' || isString(value),
  username: isNonEmptyString,
  password: isNonEmptyString,
  role: (value: unknown): value is Role | undefined =>
    value === undefined || isRole(value),
  createdAt: (value: unknown): value is Date | undefined =>
    typeof value === 'undefined' || value instanceof Date,
});

/**
 * New user object.
 */
function new_(user?: Partial<IUser>): IUser {
  return parseUser({ ...GetDefaults(), ...user }, (errors) => {
    throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
  });
}

export default {
  new: new_,
  isComplete: isCompleteUser,
} as const;
