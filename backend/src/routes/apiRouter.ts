import { Router, type Request } from 'express';
import multer from 'multer';
import path from 'path';

import Paths, { JetPaths } from '@src/common/constants/Paths';

import AdminRoutes from './AdminRoutes';
import SellerRoutes from './SellerRoutes';
import UserRoutes from './UserRoutes';
import AuthRoutes from './AuthRoutes';
import requireRole from '@src/common/middleware/authMiddleware';

const apiRouter = Router();

const uploadDir = path.join(__dirname, '../public/uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
});

// ----------------------- Add UserRouter --------------------------------- //
const userRouter = Router();
// Use the relative path from Paths object for the local endpoints
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Mount using JetPaths._ + Paths.Users._ which is '/api/users'
apiRouter.use(JetPaths.Users._, userRouter);


// ----------------------- Add SellerRouter ------------------------------- //
const sellerRouter = Router();
sellerRouter.use(requireRole('SELLER')); // Isolated safely under /api/sellers

sellerRouter.get(Paths.Sellers.Get, SellerRoutes.getAll);
sellerRouter.post(Paths.Sellers.Add, SellerRoutes.add);
sellerRouter.put(Paths.Sellers.Update, SellerRoutes.update);
sellerRouter.delete(Paths.Sellers.Delete, SellerRoutes.delete);

apiRouter.use(JetPaths.Sellers._, sellerRouter);


// ----------------------- Add AdminRouter -------------------------------- //
const adminRouter = Router();

adminRouter.get(Paths.Admin.Documents.Get, AdminRoutes.getAllDocuments);
adminRouter.get(Paths.Admin.Documents.GetById, AdminRoutes.getDocumentById);
adminRouter.post(Paths.Admin.Documents.Add, upload.single('document'), AdminRoutes.addDocument);
adminRouter.put(Paths.Admin.Documents.Update, requireRole('ADMIN'), AdminRoutes.updateDocument);

adminRouter.post(Paths.Admin.Attempts.Add, requireRole('ADMIN'), AdminRoutes.addVerificationAttempt);
adminRouter.get(Paths.Admin.Attempts.GetByDocument, requireRole('ADMIN'), AdminRoutes.getAttemptsByDocument);

apiRouter.use(JetPaths.Admin._, adminRouter);


// ----------------------- Add AuthRouter -------------------------------- //
const authRouter = Router();
authRouter.post(Paths.Auth.Login, AuthRoutes.login);

apiRouter.use(JetPaths.Auth._, authRouter);

export default apiRouter;