import { Router } from "express";

import {
  authMiddleware,
} from "../../../middleware/auth.middleware";

import { ItemController }
  from "../controllers/item.controller";

const router = Router();

const controller =
  new ItemController();

router.get(
  "/",
  authMiddleware,
  controller.getAll
);

router.get(
  "/:id",
  authMiddleware,
  controller.getById
);

router.post(
  "/",
  authMiddleware,
  controller.create
);

router.put(
  "/:id",
  authMiddleware,
  controller.update
);

router.delete(
  "/:id",
  authMiddleware,
  controller.delete
);

export default router;