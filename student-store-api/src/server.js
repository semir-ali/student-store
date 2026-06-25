require('dotenv').config()

const express = require('express')

const productRoutes = require('./routes/productRoute')
const orderRoutes = require('./routes/orderRoute')

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Student Store API')
})

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
