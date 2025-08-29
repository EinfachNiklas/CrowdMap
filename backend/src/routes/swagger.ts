import {parse} from 'yaml';
import { readFileSync } from "fs";
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';


const router = express.Router();

const swaggerDocument = parse(readFileSync(path.join(__dirname,"openapi.yaml")).toString());

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;