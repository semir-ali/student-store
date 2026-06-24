import express from 'express'
import dotenv from 'dotenv'
import Product from './models/product.js'

dotenv.config()

const app = express()
app.use(express.json())

// Returns a list of required product fields that are missing from the body.
function missingProductFields(body) {
  const required = ['name', 'price', 'category']
  return required.filter((field) => body[field] === undefined || body[field] === null || body[field] === '')
}

// GET /products — list all products (optional ?category= and ?sort= filters)
app.get('/products', async (req, res) => {
  try {
    const { category, sort } = req.query
    const products = await Product.list({ category, sort })
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /products/:id — fetch a single product by id
app.get('/products/:id', async (req, res) => {
  const product = await Product.get(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.status(200).json(product)
})

// POST /products — create a new product
app.post('/products', async (req, res) => {
  const missing = missingProductFields(req.body)
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /products/:id — update an existing product
app.put('/products/:id', async (req, res) => {
  const missing = missingProductFields(req.body)
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }
  try {
    const product = await Product.update(req.params.id, req.body)
    res.status(200).json(product)
  } catch (err) {
    // Prisma throws P2025 when the record to update does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /products/:id — delete a product by id
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.remove(req.params.id)
    res.status(200).json(product)
  } catch (err) {
    // Prisma throws P2025 when the record to delete does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(500).json({ error: 'Database failed to update' })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
