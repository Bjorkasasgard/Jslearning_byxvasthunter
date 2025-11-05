// /backend/src/api/controllers/products.controller.js
const productService = require('../../services/json.service.js');

// GET /api/products
async function getAllProducts(req, res, next) {
  try {
    const products = await productService.readProductsData();
    res.json(products);
  } catch (error) {
    next(error); // Lempar error ke errorHandler
  }
}

// GET /api/products/:id
async function getProductById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.findProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(product);
  } catch (error) {
    next(error); // Lempar error ke errorHandler
  }
}

module.exports = {
  getAllProducts,
  getProductById,
};