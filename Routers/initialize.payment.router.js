import express from "express";

import { authenticator } from "../middlewares/auth.js";
import { initializePayment } from "../utils/initializeAPayment.js";


const initializePaymentRouter = new express.Router();

initializePaymentRouter.post("/initializePayment", initializePayment);

export default initializePaymentRouter;