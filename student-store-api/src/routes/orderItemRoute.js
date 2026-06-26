const express = require('express')
const router = express.Router()

const { getOrderItems } = require('../controllers/orderItemController')

router.get('/', getOrderItems) // GET /order-items

module.exports = router
