const express = require('express')
const router = express.Router()

const {
  getOrders,
  getOrderById,
  createOrder,
  addOrderItem,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController')

router.get('/', getOrders) // GET    /orders
router.get('/:order_id', getOrderById) // GET    /orders/:order_id
router.post('/', createOrder) // POST   /orders
router.post('/:order_id/items', addOrderItem) // POST /orders/:order_id/items
router.put('/:order_id', updateOrder) // PUT    /orders/:order_id
router.delete('/:order_id', deleteOrder) // DELETE /orders/:order_id

module.exports = router
