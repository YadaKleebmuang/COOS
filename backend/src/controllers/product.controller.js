const ProductModel = require('../models/product.model');

function getProducts(req, res) {
  const products = ProductModel.findAll();
  res.json(products);
}

function getProductById(req, res) {
  const product = ProductModel.findById(parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
}

function createProduct(req, res) {
  const newProduct = ProductModel.create(req.body);
  res.status(201).json(newProduct);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
