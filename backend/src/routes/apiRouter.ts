import { Router, type Request } from 'express';
import multer from 'multer';
import path from 'path';

import Paths, { JetPaths } from '@src/common/constants/Paths';

import AdminRoutes from './AdminRoutes';
import SellerRoutes from './SellerRoutes';
import UserRoutes from './UserRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

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

userRouter.get(JetPaths.Users.Get(), UserRoutes.getAll);
userRouter.post(JetPaths.Users.Add(), UserRoutes.add);
userRouter.put(JetPaths.Users.Update(), UserRoutes.update);
userRouter.delete(JetPaths.Users.Delete(), UserRoutes.delete);

apiRouter.use('/', userRouter);

// ----------------------- Add SellerRouter ------------------------------- //

const sellerRouter = Router();
sellerRouter.get(JetPaths.Sellers.Get(), SellerRoutes.getAll);
sellerRouter.post(JetPaths.Sellers.Add(), SellerRoutes.add);
sellerRouter.put(JetPaths.Sellers.Update(), SellerRoutes.update);
sellerRouter.delete(JetPaths.Sellers.Delete(), SellerRoutes.delete);
apiRouter.use('/', sellerRouter);

// ----------------------- Add AdminRouter -------------------------------- //

const adminRouter = Router();
adminRouter.get(JetPaths.Admin.Documents.Get(), AdminRoutes.getAllDocuments);
adminRouter.get(JetPaths.Admin.Documents.GetById(), AdminRoutes.getDocumentById);
adminRouter.post(JetPaths.Admin.Documents.Add(), upload.single('document'), AdminRoutes.addDocument);
adminRouter.put(JetPaths.Admin.Documents.Update(), AdminRoutes.updateDocument);
adminRouter.post(JetPaths.Admin.Attempts.Add(), AdminRoutes.addVerificationAttempt);
adminRouter.get(
  JetPaths.Admin.Attempts.GetByDocument(),
  AdminRoutes.getAttemptsByDocument,
);
apiRouter.use('/', adminRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
