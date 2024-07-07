import ProductModel from "./product.model.js";
import ProductRepository from "./product.repository.js";

export default class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async addProduct(req, res) {
    try {
      const { name, price, sizes, categories, description } = req.body;
      const createdRecord = new ProductModel(
        name,
        parseFloat(price),
        sizes?.split(","),
        req?.file?.filename,
        categories,
        description
      );
      console.log("inside product cotroller add producr ", createdRecord);
      const newpro = await this.productRepository.add(createdRecord);
      res.status(201).send(newpro);
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await this.productRepository.getAll();
      res.status(200).send(products);
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }
  async getOneProduct(req, res) {
    try {
      const id = req.params.id;
      const product = await this.productRepository.get(id);
      if (!product) {
        res.status(404).send("Product not found");
      } else {
        return res.status(200).send(product);
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }

  async rateProduct(req, res, next) {
    // console.log(req.query);
    try {
      const userID = req.userID;
      const productID = req.body.productID;
      const rating = req.body.rating;
      await this.productRepository.rate(userID, productID, rating);
      return res.status(200).send("Rating has been added");
    } catch (err) {
      console.log(err);
      console.log("Passing error to middleware");
      next(err);
    }
  }

  async filterProducts(req, res) {
    try {
      const minPrice = req.query.minPrice;
      const maxPrice = req.query.maxPrice;
      const categories = req.query.categories;
      const result = await this.productRepository.filter(minPrice, categories);
      res.status(200).send(result);
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }

  async averagePrice(req, res, next) {
    try {
      const result = await this.productRepository.averageProductPriceCategory();
      res.status(200).send(result);
    } catch (err) {
      console.log(err);
      return res.status(400).send("somthing went wrorng here");
    }
  }
}
