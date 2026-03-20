import { Router } from "express";
import { ServerController } from "../controllers/controller";
const router = Router();

router.get("/servercheck", ServerController.servercheck);
router.get("/apidetails", ServerController.fetchAPiConfig);
router.get("/fetchtokensnapshot", ServerController.FetchTokenSnapshot);
router.get("/fetchtokendetails", ServerController.FetchTokenInfo);

export default router;
