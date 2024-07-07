import UserModel from "./user.model.js";
import jwt from "jsonwebtoken";
import UserRepository from "./user.repository.js";
import bcrypt from "bcrypt";
// const userRepository = new UserRepository();

console.log("jwt", process.env.JW_SECRET);

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async signUp(req, res, next) {
    try {
      console.log("inside signUp", req.body);
      const { name, email, password, type } = req.body;

      const hashpassword = await bcrypt.hash(password, 12);
      const obj = {
        name: name,
        email: email,
        password: hashpassword,
        type: type,
      };
      // const user = new UserModel(name, email, hashpassword, type);
      console.log(obj);
      await this.userRepository.signUp(obj);
      res.status(201).send(obj);
    } catch (err) {
      console.log(err);
      next(err);
      // return res.status(400).send("somthing went wrorng here");
    }
  }

  async signIn(req, res) {
    try {
      // find user by email
      const user = await this.userRepository.findByEmail(req.body.email);
      if (!user) {
        return res.status(400).send("Incorrect Credentials");
      } else {
        // comparing password with hashed password
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
          return res.status(400).send("Incorrect Credentials");
        } else {
          // 1. Create token.
          const token = jwt.sign(
            {
              userID: user._id,
              email: user.email,
            },
            process.env.JW_SECRET,
            {
              expiresIn: "1h",
            }
          );
          // 2. Send token.
          return res.status(200).send(token);
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }
  async resetPassword(req, res, next) {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const userID = req.userID;
    try {
      await this.userRepository.resetPassword(userID, hashedPassword);
      res.status(200).send("Password is updated");
    } catch (err) {
      console.log(err);
      console.log("Passing error to middleware");
      next(err);
    }
  }
}
