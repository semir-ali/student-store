import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import OrderDetail from "../OrderDetail/OrderDetail";
import NotFound from "../NotFound/NotFound";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import { formatPrice } from "../../utils/format";
import { API_BASE_URL } from "../../constants";
import "./App.css";

function App() {

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", dorm_number: ""});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [sort, setSort] = useState(null); // null | "asc" | "desc" — sorts by price on the backend

  // Fetch products from the API, forwarding the sort to the backend's ?sort= query.
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/products`, {
          params: sort ? { sort } : {},
        });
        setProducts(data);
      } catch (err) {
        setError("Failed to load products. Is the backend running?");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProducts();
  }, [sort]);

  // Cycle the price sort: none -> asc -> desc -> none.
  const handleToggleSort = () =>
    setSort((current) => (current === null ? "asc" : current === "asc" ? "desc" : null));

  // Toggles sidebar
  const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);

  // Functions to change state (used for lifting state)
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart);

  const handleOnSearchInputChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Handles the checkout process through calling the POST /orders route with the correct body
  const handleOnCheckout = async () => {
    const items = Object.keys(cart).map((productId) => ({
      product_id: Number(productId),
      quantity: cart[productId],
    }));

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!userInfo.name || !userInfo.email) {
      setError("Please enter your name and email before checking out.");
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/orders`, {
        customer_name: userInfo.name,
        customer_email: userInfo.email,
        status: "complete",
        items,
      });

      // Build the receipt view object CheckoutSuccess reads (order.purchase.receipt.lines).
      const lines = [
        `Order #${data.order_id} confirmed for ${data.customer_name}`,
        ...data.items.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          const name = product ? product.name : `Product ${item.product_id}`;
          return `${item.quantity} x ${name} — ${formatPrice(item.price * item.quantity)}`;
        }),
        `Total: ${formatPrice(data.total_price)}`,
      ];

      setOrder({ ...data, purchase: { receipt: { lines } } });
      setCart({});
    } catch (err) {
      const message = err?.response?.data?.error || "Checkout failed. Please try again.";
      setError(message);
    } finally {
      setIsCheckingOut(false);
    }
  };


  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleOnAddToCart}
          removeFromCart={handleOnRemoveFromCart}
          getQuantityOfItemInCart={handleGetItemQuantity}
          getTotalItemsInCart={handleGetTotalCartItems}
          handleOnCheckout={handleOnCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchInputValue={searchInputValue}
            handleOnSearchInputChange={handleOnSearchInputChange}
            sort={sort}
            handleToggleSort={handleToggleSort}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="/orders/:orderId"
              element={<OrderDetail products={products} />}
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  cart={cart}
                  error={error}
                  products={products}
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound
                  error={error}
                  products={products}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
 