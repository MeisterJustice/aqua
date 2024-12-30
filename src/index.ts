import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { AppInitializer } from "./initialization";
import { logger } from "./logger";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

process.on("SIGTERM", () => AppInitializer.stop());
process.on("SIGINT", () => AppInitializer.stop());

app.listen(port, async () => {
  logger.info(`Server running on port ${port}`);
  await AppInitializer.start();
});
