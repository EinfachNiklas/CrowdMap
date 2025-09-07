import {parse} from 'yaml';
import { readFileSync } from "fs";
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type {OpenAPIV3_1} from 'openapi-types';


const router = express.Router();

const specPath = path.join(__dirname, 'openapi.yaml');
let swaggerDocument: OpenAPIV3_1.Document;
try {
  const raw = readFileSync(specPath, 'utf8');
  swaggerDocument = parse(raw);
} catch (err) {
  console.error(`Failed to read/parse OpenAPI spec at ${specPath}:`, err);
  throw err;
}

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;