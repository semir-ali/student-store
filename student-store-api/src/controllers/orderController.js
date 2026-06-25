const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function missingOrderFields(body) {
  const required = ['customer_name', 'customer_email', 'status']
  return required.filter((field) => body[field] === undefined || body[field] === null || body[field] === '')
}

// GET /orders — list all orders
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany()
    res.status(200).json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

// GET /orders/:order_id — fetch a single order along with its items
const getOrderById = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { order_id: Number(req.params.order_id) },
    include: { items: true },
  })
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  res.status(200).json(order)
}

// POST /orders — create a new order with its items (transactional).
// Body: { customer_name, customer_email, status, items: [{ product_id, quantity }] }.
// total_price is computed server-side from the products, not taken from the body.
const createOrder = async (req, res) => {
  // Move into helper function - every function needs to do ONE THING!
  const missing = missingOrderFields(req.body)
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }

  // items must be a non-empty array of line items.
  const { customer_name, customer_email, status, items } = req.body
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: items' })
  }
  const badItem = items.some(
    (item) => item.product_id === undefined || item.quantity === undefined,
  )
  if (badItem) {
    return res.status(400).json({ error: 'Each item must include product_id and quantity' })
  }

  try {
    // Run the order + its items in one transaction so a bad item rolls it all back.
    const order = await prisma.$transaction(async (tx) => {
      let total_price = 0
      const lineItems = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.product_id) },
        })
        if (!product) {
          const err = new Error('Product in Order is not found')
          err.code = 'PRODUCT_NOT_FOUND'
          throw err
        }

        // Capture the price at order time and add this line to the total.
        const quantity = Number(item.quantity)
        total_price += product.price * quantity
        lineItems.push({ product_id: product.id, quantity, price: product.price })
      }

      return tx.order.create({
        data: {
          customer_name,
          customer_email,
          status,
          total_price,
          items: { create: lineItems },
        },
        include: { items: true },
      })
    })

    res.status(201).json(order)
  } catch (err) {
    // A referenced product does not exist -> 404 per the planning.md contract.
    if (err.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Product in Order is not found' })
    }
    res.status(500).json({ error: 'Failed to create order, transaction rolled back' })
  }
}

// PUT /orders/:order_id — update an existing order (typically status)
const updateOrder = async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { order_id: Number(req.params.order_id) },
      data: { status: req.body.status },
    })
    res.status(200).json(order)
  } catch (err) {
    // Prisma throws P2025 when the record to update does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(500).json({ error: 'Failed to update order' })
  }
}

// DELETE /orders/:order_id — delete an order by order_id
const deleteOrder = async (req, res) => {
  try {
    const order = await prisma.order.delete({
      where: { order_id: Number(req.params.order_id) },
    })
    res.status(200).json(order)
  } catch (err) {
    // Prisma throws P2025 when the record to delete does not exist
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(500).json({ error: 'Failed to delete order' })
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}
