import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware";

import { TransferController } from "../controllers/transfer.controller";

const router = Router();

const controller =
  new TransferController();

router.get(
  "/",
  authMiddleware,
  controller.findMany
);

router.get(
  "/:id",
  authMiddleware,
  controller.findById
);

router.post(
  "/",
  authMiddleware,
  controller.create
);

router.post(
  "/:id/request",
  authMiddleware,
  controller.request
);

router.post(
  "/:id/pick",
  authMiddleware,
  controller.pick
);

router.post(
  "/:id/dispatch",
  authMiddleware,
  controller.dispatch
);

router.post(
  "/:id/receive",
  authMiddleware,
  controller.receive
);

router.post(
  "/:id/cancel",
  authMiddleware,
  controller.cancel
);

export default router;