import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { UnitController } from "./unit.controller";

const router = Router();

const unitController = new UnitController();

router.get(
  "/",
  authMiddleware,
  unitController.getUnits.bind(unitController),
);

export default router;
