// This file is loaded first via tsx --require, before any other module.
// It ensures process.env is populated before db/index.ts is evaluated.
import dotenv from "dotenv";
dotenv.config();
