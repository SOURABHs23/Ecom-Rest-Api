import mongoose from "mongoose";
import { categorySchema } from "../features/product/category.schema.js";

const url = process.env.DB_URL;

export const connectUsingMongoose = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongodb using mongoose is connected ");
    addCategories();
  } catch (err) {
    console.log(err);
  }
};

async function addCategories() {
  const CategoryModel = mongoose.model("Category", categorySchema);
  const categories = await CategoryModel.find();

  if (!categories || categories.length == 0) {
    await CategoryModel.insertMany([
      { name: "books" },
      { name: "clothing" },
      { name: "Electronics" },
    ]);
  }
  console.log("Categories are added");
}
