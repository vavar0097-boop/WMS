import { Router } from "express";

import { TransferController } from "../controllers/transfer.controller";

const router = Router();

const controller =
  new TransferController();

router.get(
  "/",
  controller.findMany
);

router.get(
  "/:id",
  controller.findById
);

router.post(
  "/",
  controller.create
);

router.post(
  "/:id/request",
  controller.request
);

router.post(
  "/:id/pick",
  controller.pick
);

router.post(
  "/:id/dispatch",
  controller.dispatch
);

router.post(
  "/:id/receive",
  controller.receive
);

router.post(
  "/:id/cancel",
  controller.cancel
);

export default router;