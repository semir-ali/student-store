const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Returns a list of required product fields that are missing from the body.
function missingProductFields(body) {
  const required = ['name', 'price', 'category']
  return required.filter((field) => body[field] === undefined || body[field] === null || body[field] === '')
}

// GET /products — list all products (optional ?category= and ?sort= filters)
const getProducts = async (req, res) => {
  try {
    const { category, sort } = req.query
    const query = {}
    if (category) {
      query.where = { category }
    }
    if (sort === 'asc' || sort === 'desc') {
      query.orderBy = { price: sort }
    }
    const products = await prisma.product.findMany(query)
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}

// GET /products/:id — fetch a single product by id
const getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  })
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.status(200).json(product)
}

// POST /products — create a new product
const createProduct = async (req, res) => {
  const missing = missingProductFields(req.body)
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }
  try {
    const { name, description, price, image_url, category } = req.body
    const product = await prisma.product.create({
      data: { name, description, price, image_url, category },
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' })
  }
}

// PUT /products/:id — update an existing product
const updateProduct = async (req, res) => {
  const missing = missingProductFields(req.body)
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }
  try {
    const { name, description, price, image_url, category } = req.body
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, description, price, image_url, category },
    })
    res.status(200).json(product)
  } catch (err) {
    // Prisma throws P2025 when the record to update does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(500).json({ error: 'Failed to update product' })
  }
}

// DELETE /products/:id — delete a product by id
const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: { id: Number(req.params.id) },
    })
    res.status(200).json(product)
  } catch (err) {
    // Prisma throws P2025 when the record to delete does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(500).json({ error: 'Database failed to update' })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
