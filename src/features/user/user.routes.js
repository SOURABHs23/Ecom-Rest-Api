// Manage routes/paths to ProductController

// 1. Import express.
import express from "express";
import UserController from "./user.controller.js";
import jwtAuth from "../../middlewares/jwt.middleware.js";

// 2. Initialize Express router.
const userRouter = express.Router();

const userController = new UserController();
// console.log("hhe");
// console.log(userController);

// All the paths to controller methods.

userRouter.post("/signup", (req, res, next) => {
  //   console.log("in controler router", req.body);
  userController.signUp(req, res, next);
});
userRouter.post("/signin", (req, res, next) => {
  userController.signIn(req, res, next);
});

userRouter.put("/resetPassword", jwtAuth, (req, res, next) => {
  userController.resetPassword(req, res, next);
});
// userRouter.post("/signup", userController.signUp);
// userRouter.post("/signin", userController.signIn);

export default userRouter;
