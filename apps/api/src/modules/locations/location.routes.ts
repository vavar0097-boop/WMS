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

router.post(
  "/",
  authMiddleware,
  locationController.createLocation.bind(locationController),
);

router.put(
  "/:id",
  authMiddleware,
  locationController.updateLocation.bind(locationController),
);

router.delete(
  "/:id",
  authMiddleware,
  locationController.deleteLocation.bind(locationController),
);

export default router;
