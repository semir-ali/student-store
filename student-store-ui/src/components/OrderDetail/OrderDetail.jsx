import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../../constants"
import { formatPrice } from "../../utils/format"
import "./OrderDetail.css"

// Page view for a single order at /orders/:orderId. Reads the id from the URL
// and fetches GET /orders/:order_id (which includes the order's items).
function OrderDetail({ products = [] }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      setIsFetching(true)
      setError(null)
      try {
        const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
        setOrder(data)
      } catch (err) {
        setError("Failed to load order details.")
      } finally {
        setIsFetching(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const productName = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : `Product #${productId}`
  }

  return (
    <div className="OrderDetail">
      <button type="button" className="order-detail-back" onClick={() => navigate("/")}>
        &larr; Back to store
      </button>

      {isFetching && <p className="order-detail-status">Loading order...</p>}
      {error && <p className="order-detail-error">{error}</p>}

      {order && (
        <div className="order-detail-card">
          <h1>Order #{order.order_id}</h1>
          <p className="order-detail-meta">
            {new Date(order.created_at).toLocaleDateString()} · {order.status}
          </p>
          <p className="order-detail-customer">
            {order.customer_name} · {order.customer_email}
          </p>

          <table className="order-detail-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.order_item_id}>
                  <td>{productName(item.product_id)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="order-detail-total">
            Total: {formatPrice(order.total_price)}
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
