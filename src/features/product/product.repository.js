import { ApplicationError } from "../../error-handler/applicationError.js";
import { getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const ProductModel = mongoose.model("Product", productSchema);
const ReviewModel = mongoose.model("Review", reviewSchema);
const CategoryModel = mongoose.model("Category", categorySchema);

class ProductRepository {
  async add(productData) {
    try {
      // add the product
      productData.categories = productData.category
        .split(",")
        .map((e) => e.trim());
      console.log(productData);
      const newproduct = new ProductModel(productData);
      const savedProduct = await newproduct.save();
      // update categories

      await CategoryModel.updateMany(
        {
          _id: { $in: productData.categories },
        },
        {
          $push: { products: new ObjectId(savedProduct._id) },
        }
      );
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
      // check if product exits
      const productToupdate = await ProductModel.findById(productID);
      if (!productToupdate) {
        throw new Error("Product not found");
      }
      // get the exixting review
      const userReview = await ReviewModel.findOne({
        product: new ObjectId(productID),
        user: new ObjectId(userID),
      });

      if (userReview) {
        userReview.rating = rating;
        await userReview.save();
      } else {
        const newReview = new ReviewModel({
          product: new ObjectId(productID),
          user: new ObjectId(userID),
          rating: rating,
        });
        await newReview.save();
      }
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
