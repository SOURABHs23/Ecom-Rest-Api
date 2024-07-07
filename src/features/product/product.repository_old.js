import { ApplicationError } from "../../error-handler/applicationError.js";
import { getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";

class ProductRepository {
  //
  constructor() {
    this.collection = "products";
  }
  async add(newProduct) {
    try {
      // 1. Get the database
      const db = getDB();
      // 2. Get the collection
      const collection = db.collection(this.collection);
      // 3. Insert the document.
      await collection.insertOne(newProduct);
      return newProduct;
    } catch (err) {
      throw new ApplicationError("Something went wrong", 500);
    }
  }

  async getAll() {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const allpro = await collection.find().toArray();
      return allpro;
    } catch (err) {
      throw new ApplicationError(
        "Something went wrong in getall in product",
        500
      );
    }
  }

  async get(id) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong in get in product", 500);
    }
  }
  async filter(minPrice, categories) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      let filterExpression = {};
      if (minPrice) {
        filterExpression.price = { $gte: parseFloat(minPrice) };
      }
      // if (maxPrice) {
      //   filterExpression.price = {
      //     ...filterExpression.price,
      //     $lte: parseFloat(maxPrice),
      //   };
      // }
      console.log(categories);
      categories = JSON.parse(categories.replace(/'/g, '"'));
      console.log(categories);
      if (categories) {
        filterExpression = {
          $or: [{ category: { $in: categories } }, filterExpression],
        };
        // filterExpression.category=category
      }
      console.log("in filter", filterExpression);
      return await collection
        .find(filterExpression)
        .project({ name: 1, price: 1, _id: 0, ratings: { $slice: 1 } })
        .toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong in get in product", 500);
    }
  }

  async rate(userID, productID, rating) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      // 1. Removes existing entry
      await collection.updateOne(
        {
          _id: new ObjectId(productID),
        },
        {
          $pull: { ratings: { userID: new ObjectId(userID) } },
        }
      );
      // 2. Add new entry
      await collection.updateOne(
        {
          _id: new ObjectId(productID),
        },
        {
          $push: { ratings: { userID: new ObjectId(userID), rating } },
        }
      );
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async averageProductPriceCategory() {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection
        .aggregate([
          {
            $group: {
              _id: "$category",
              averagePrice: { $avg: "$price" },
            },
          },
        ])
        .toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }
}

export default ProductRepository;

// db.products.aggregate([
//   {
//     $unwind: "$ratings",
//   },
//   {
//     $group: {
//       _id: "$name",
//       averageRating: { $avg: "$ratings.rating" },
//     },
//   },
// ]);

// db.products.aggregate([
//   {
//     $project: {
//       name: 1,
//       countOfRating: {
//         $cond: {
//           if: { $isArray: "$ratings" },
//           then: { $size: "$ratings" },
//           else: 0,
//         },
//       },
//     },
//   },
//   {
//     $sort: { countOfRating: -1 },
//   },
//   {
//     $limit: 2,
//   },
// ]);

// async rate(userID, productID, rating) {
//   try {
//     const db = getDB();
//     const collection = db.collection(this.collection);
//     // 1. Find the product
//     const product = await collection.findOne({
//       _id: new ObjectId(productID),
//     });
//     // console.log(product);
//     // 2. Find the rating
//     const userRating = await product?.ratings?.find(
//       (r) => r.userID == userID
//     );
//     console.log("inside rate", userRating);
//     if (userRating) {
//       // 3. Update the rating
//       await collection.updateOne(
//         {
//           _id: new ObjectId(productID),
//           "ratings.userID": new ObjectId(userID),
//         },
//         {
//           $set: {
//             "ratings.$.rating": rating,
//           },
//         }
//       );
//     } else {
//       await collection.updateOne(
//         {
//           _id: new ObjectId(productID),
//         },
//         {
//           $push: { ratings: { userID: new ObjectId(userID), rating } },
//         }
//       );
//     }
//   } catch (err) {
//     console.log(err);
//     throw new ApplicationError("Something went wrong with database", 500);
//   }
// }
