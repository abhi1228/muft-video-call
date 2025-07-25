import { Router } from "express";
import { login, register,getUserHistory,addToHistory } from "../controllers/user.controller.js";

const router=Router();
console.log("router");
router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);

export default router;