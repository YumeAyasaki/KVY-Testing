import { Req, Res } from './common/express-types';
import UserRepo from '@src/repos/UserRepo';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { signToken } from '@src/common/utils/auth';

async function login(req: Req, res: Res) {
  const body = req.body as { username?: string; password?: string };
  if (!body.username || !body.password) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'username and password required' });
  }

  const user = await UserRepo.getByUsername(body.username.trim());
  if (!user) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
  }

  // NOTE: passwords are stored in plaintext in this project; compare directly.
  if (user.password !== body.password) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, role: user.Role });
  res.status(HttpStatusCodes.OK).json({ token, role: user.Role });
}

export default {
  login,
} as const;
