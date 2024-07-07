import OrderRepository from "./order.repository.js";
import OrderModel from "./order.model.js";

export default class OrderController {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async placeOrder(req, res, next) {
    try {
      const userID = req.userID;
      await this.orderRepository.placeOrder(userID);
      res.status(201).send("Order is created");
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }
}
