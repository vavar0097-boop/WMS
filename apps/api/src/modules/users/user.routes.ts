import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { UserController } from "./user.controller";

const router = Router();

const userController = new UserController();

router.get(
  "/",
  authMiddleware,
  userController.getUsers.bind(userController),
);

router.get(
  "/roles",
  authMiddleware,
  userController.getRoles.bind(userController),
);

router.post(
  "/",
  authMiddleware,
  userController.createUser.bind(userController),
);

router.put(
  "/:id",
  authMiddleware,
  userController.updateUser.bind(userController),
);

router.delete(
  "/:id",
  authMiddleware,
  userController.deleteUser.bind(userController),
);

export default router;
