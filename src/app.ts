import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { logger } from "./config/logger";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(helmet());

app.use(compression());

app.use(cookieParser());

app.use(express.json());

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WMS API Online",
  });
});

import { errorMiddleware } from "./middleware/error.middleware";

app.use(errorMiddleware);

import authRoutes
from "./routes/auth.routes";
app.use(
  "/api/auth",
  authRoutes
);

import itemRoutes
  from "./modules/items/routes/item.route";

app.use(
  "/api/items",
  itemRoutes
);

import stockRoutes
from "./modules/stocks/routes/stock.route";
app.use(
  "/api/stocks",
  stockRoutes
);

export default app;