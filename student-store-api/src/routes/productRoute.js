const express = require('express')
const router = express.Router()

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

router.get('/', getProducts) // GET    /products
router.get('/:id', getProductById) // GET    /products/:id
router.post('/', createProduct) // POST   /products
router.put('/:id', updateProduct) // PUT    /products/:id
router.delete('/:id', deleteProduct) // DELETE /products/:id

module.exports = router
