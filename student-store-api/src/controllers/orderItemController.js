const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// GET /order-items — list every order item across all orders
const getOrderItems = async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany()
    res.status(200).json({ orderItems })
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch order items.' })
  }
}

module.exports = {
  getOrderItems,
}
