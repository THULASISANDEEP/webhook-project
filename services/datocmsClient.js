import { buildClient } from "@datocms/cma-client-node";
import dotenv from "dotenv";

dotenv.config();

export const datoClient = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN,
  environment: process.env.DATOCMS_ENV || "development",
});