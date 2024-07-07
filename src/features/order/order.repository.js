import { ApplicationError } from "../../error-handler/applicationError.js";
import { getClient, getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import OrderModel from "./order.model.js";

//
export default class OrderRepository {
  constructor() {
    this.collection = "orders";
  }

  async placeOrder(userID) {
    const client = getClient();
    const session = client.startSession();
    try {
      const db = getDB();
      session.startTransaction();
      // get the cart item and create the total amount
      const items = await this.getTotalAmount(userID, session);
      const totalamount = items.reduce(
        (acc, item) => acc + item.totalAmount,
        0
      );
      console.log(totalamount);
      // create an order record
      const newOrder = new OrderModel(
        new ObjectId(userID),
        totalamount,
        new Date()
      );
      await db.collection(this.collection).insertOne(newOrder, { session });
      // reduce the stock
      for (let item of items) {
        await db
          .collection("products")
          .updateOne(
            { _id: item.productID },
            { $inc: { stock: -item.quantity } },
            { session }
          );
      }
      await db.collection("cartItems").deleteMany(
        {
          userID: new ObjectId(userID),
        },
        { session }
      );
      await session.commitTransaction();
      session.endSession();
      return;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async getTotalAmount(userID, session) {
    const db = getDB();
    console.log(userID);
    const items = await db
      .collection("cartItems")
      .aggregate(
        [
          {
            $match: { userID: new ObjectId(userID) },
          },
          {
            $lookup: {
              from: "products",
              localField: "productID",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          //unwind the productInfo
          {
            $unwind: "$productInfo",
          },
          //calculate the total amount for each carditems
          {
            $addFields: {
              totalAmount: {
                $multiply: ["$productInfo.price", "$quantity"],
              },
            },
          },
        ],
        { session }
      )
      .toArray();
    // console.log(items);
    return items;
  }
}
