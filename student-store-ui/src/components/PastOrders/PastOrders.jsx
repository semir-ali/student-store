import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "../../constants"
import { formatPrice } from "../../utils/format"
import "./PastOrders.css"

// "See Past Orders" button + modal listing every completed order.
// Clicking an order navigates to its detail page at /orders/:orderId.
// Users can also filter the list by the email of the person who placed the order.
function PastOrders() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  // Email filter state: what the user is typing vs. the email currently applied.
  const [emailInput, setEmailInput] = useState("")
  const [activeEmail, setActiveEmail] = useState("")

  // GET all orders, then keep only the completed ones.
  const fetchOrders = async () => {
    setIsFetching(true)
    setError(null)
    try {
      const { data } = await axios.get(`${API_BASE_URL}/orders`)
      setOrders(data.filter((order) => order.status === "complete"))
    } catch (err) {
      setError("Failed to load orders. Is the backend running?")
    } finally {
      setIsFetching(false)
    }
  }

  const openModal = () => {
    setIsOpen(true)
    fetchOrders()
  }

  const closeModal = () => {
    setIsOpen(false)
    setOrders([])
    setError(null)
    setEmailInput("")
    setActiveEmail("")
  }

  const handleSelectOrder = (orderId) => {
    closeModal()
    navigate(`/orders/${orderId}`)
  }

  // Apply the typed email as the active filter (case-insensitive, trimmed).
  const handleFilterSubmit = (event) => {
    event.preventDefault()
    setActiveEmail(emailInput.trim().toLowerCase())
  }

  // Return to the full list of orders.
  const clearFilter = () => {
    setEmailInput("")
    setActiveEmail("")
  }

  // Orders shown after applying the active email filter (if any).
  const visibleOrders = activeEmail
    ? orders.filter((order) => order.customer_email?.toLowerCase() === activeEmail)
    : orders

  return (
    <>
      <button type="button" className="past-orders-button" onClick={openModal}>
        See Past Orders
      </button>

      {isOpen && (
        <div className="past-orders-overlay" onClick={closeModal}>
          <div
            className="past-orders-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="past-orders-close"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>

            <h2>Past Orders</h2>

            <form className="past-orders-filter" onSubmit={handleFilterSubmit}>
              <input
                type="email"
                className="past-orders-filter-input"
                placeholder="Filter by email..."
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                aria-label="Filter orders by email"
              />
              <button type="submit" className="past-orders-filter-button">
                Filter
              </button>
            </form>

            {activeEmail && (
              <p className="past-orders-meta">
                Showing orders for <strong>{activeEmail}</strong>
                {" — "}
                <button
                  type="button"
                  className="past-orders-back"
                  onClick={clearFilter}
                >
                  Show all orders
                </button>
              </p>
            )}

            {error && <p className="past-orders-error">{error}</p>}
            {isFetching && <p className="past-orders-empty">Loading orders...</p>}
            {!isFetching && !error && orders.length === 0 && (
              <p className="past-orders-empty">No completed orders yet.</p>
            )}
            {!isFetching && !error && orders.length > 0 && visibleOrders.length === 0 && (
              <p className="past-orders-empty">No orders found for that email.</p>
            )}

            {visibleOrders.length > 0 && (
              <table className="past-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="past-orders-row"
                      onClick={() => handleSelectOrder(order.order_id)}
                    >
                      <td>#{order.order_id}</td>
                      <td>{order.customer_email}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{formatPrice(order.total_price)}</td>
                      <td>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default PastOrders
