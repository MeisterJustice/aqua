import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import logger from "./logger";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.listen(port, async () => {
  logger.info(`
  Server running:
  - Port: ${port}
  - Mode: ${process.env.NODE_ENV || "development"}
    `);
});
