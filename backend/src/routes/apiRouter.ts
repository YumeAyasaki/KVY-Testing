import { Router } from 'express';

import Paths from '@src/common/constants/Paths';

import AdminRoutes from './AdminRoutes';
import SellerRoutes from './SellerRoutes';
import UserRoutes from './UserRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ----------------------- Add UserRouter --------------------------------- //

const userRouter = Router();

userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

apiRouter.use(Paths.Users._, userRouter);

// ----------------------- Add SellerRouter ------------------------------- //

const sellerRouter = Router();
sellerRouter.get(Paths.Sellers.Get, SellerRoutes.getAll);
sellerRouter.post(Paths.Sellers.Add, SellerRoutes.add);
sellerRouter.put(Paths.Sellers.Update, SellerRoutes.update);
sellerRouter.delete(Paths.Sellers.Delete, SellerRoutes.delete);
apiRouter.use(Paths.Sellers._, sellerRouter);

// ----------------------- Add AdminRouter -------------------------------- //

const adminRouter = Router();
adminRouter.get(Paths.Admin.Documents.Get, AdminRoutes.getAllDocuments);
adminRouter.get(Paths.Admin.Documents.GetById, AdminRoutes.getDocumentById);
adminRouter.put(Paths.Admin.Documents.Update, AdminRoutes.updateDocument);
adminRouter.post(Paths.Admin.Attempts.Add, AdminRoutes.addVerificationAttempt);
adminRouter.get(
  Paths.Admin.Attempts.GetByDocument,
  AdminRoutes.getAttemptsByDocument,
);
apiRouter.use(Paths.Admin._, adminRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;
