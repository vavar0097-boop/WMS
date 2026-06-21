import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { LocationController } from "./location.controller";

const router = Router();

const locationController = new LocationController();

router.get(
  "/",
  authMiddleware,
  locationController.getLocations.bind(locationController),
);

export default router;