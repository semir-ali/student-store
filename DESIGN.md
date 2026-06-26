# Product Design Document

| | |
|---|---|
| **Project** | Student Store — Full-Stack E-Commerce Platform |
| **Author** | Semir Ali |
| **Date** | June 25, 2026 |
| **Version** | 1.0 |

## Executive Summary

Student Store is a full-stack e-commerce web application that lets students browse a
catalog of products, build a shopping cart, and place orders. Unlike a client-only
project, it pairs a React + Vite frontend with an Express + Prisma + PostgreSQL backend,
giving the application a real persistence layer. Products, orders, and the line items that
connect them are stored relationally, and order creation runs inside a database
transaction so that pricing is always computed server-side and a single bad item rolls the
whole order back. Users can also review their past orders and drill into any individual
transaction.

## Product Vision & Goals

### Vision

Build a realistic, full-stack storefront that demonstrates a complete request lifecycle —
from a React UI, through a RESTful Express API, to a relational PostgreSQL database — with
correct, transactional order handling at its core.

### Key Goals

- **Browse**: Let users explore products in a responsive grid, filtered by category and search.
- **Cart**: Provide an always-available cart that tracks quantities and live totals.
- **Checkout**: Place an order that persists to the database with server-computed pricing.
- **History**: Let users review all past orders and open any single order for full detail.
- **Integrity**: Guarantee orders are atomic — pricing is authoritative server-side, and partial orders are never persisted.

## Technical Stack

| Component | Technology |
|---|---|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 (`BrowserRouter`, `Routes`, `useParams`, `useNavigate`) |
| HTTP Client | Axios |
| Styling | CSS3 (responsive grid / flexbox) |
| Backend Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Runtime | Node.js |
| Cross-Origin | `cors` middleware |
| Config | `dotenv` (`DATABASE_URL`, `PORT`) |
| State Management | React hooks (`useState`, `useEffect`), state lifted into `App` |

## Architecture Overview

```
┌──────────────────────────┐         HTTP / JSON          ┌──────────────────────────┐
│   student-store-ui        │  ──────────────────────────▶ │   student-store-api       │
│   React + Vite (Axios)    │   GET/POST/PUT/DELETE         │   Express (server.js)     │
│                           │ ◀──────────────────────────  │                           │
│  App (global state)       │                              │  Routes → Controllers     │
│  ├─ Sidebar (cart)        │                              │  ├─ /products             │
│  ├─ Home (ProductGrid)    │                              │  ├─ /orders               │
│  ├─ ProductDetail         │                              │  └─ /order-items          │
│  ├─ PastOrders / OrderDetail                             │            │              │
│  └─ NotFound              │                              │         Prisma ORM        │
└──────────────────────────┘                              │            │              │
                                                           │     PostgreSQL            │
                                                           │  Product · Order ·        │
                                                           │  OrderItem (relational)   │
                                                           └──────────────────────────┘
```

The frontend holds products and the cart in `App` and lifts handlers down to children.
All persistence happens through the API; the database is the source of truth for products,
orders, and pricing.

## Core User Journey

```
Load store ──▶ Browse products (filter by category / search)
     │
     ├─▶ Click product ──▶ ProductDetail page ──▶ Add to cart
     │
     ├─▶ Add/remove items in Sidebar cart ──▶ live total updates
     │
     ├─▶ Enter name + email ──▶ Checkout (POST /orders) ──▶ receipt
     │
     └─▶ "See Past Orders" ──▶ list of completed orders
                 │
                 └─▶ Click an order ──▶ OrderDetail page (/orders/:orderId)
```

## Checkout Data Flow (Transactional)

```
User clicks Checkout (Sidebar)
        │
        ▼
App.handleOnCheckout()  ── builds items[] from cart { product_id, quantity }
        │   POST /orders { customer_name, customer_email, status, items[] }
        ▼
orderController.createOrder()
        │  1. validate required fields + non-empty items[]
        │  2. open prisma.$transaction
        │  3. for each item: look up Product
        │        └─ not found ▶ throw PRODUCT_NOT_FOUND ▶ 404, rollback
        │  4. capture product.price onto each line; sum total_price
        │  5. create Order + nested OrderItems
        ▼
201 Created { order_id, total_price, items[...] }
        │
        ▼
App builds receipt lines ▶ CheckoutSuccess renders ▶ cart cleared
```

## User Flows

### 1. Browse & Discover Flow
1. User loads the store; `App` fetches `GET /products` on mount.
2. Products render in a responsive grid on the Home page.
3. User filters by category via the SubNavbar or types into the search box.
4. The visible product list updates client-side from the already-loaded catalog.

### 2. Product Detail Flow
5. User clicks a ProductCard.
6. React Router navigates to `/:productId`; ProductDetail renders that product.
7. User adds the product to the cart from the detail page.

### 3. Cart & Checkout Flow
8. User opens the Sidebar cart (toggle).
9. Add/remove adjusts quantities; totals recompute live via cart utilities.
10. User enters name and email.
11. User clicks Checkout → `POST /orders` with the cart mapped to `items[]`.
12. On success, a receipt is shown and the cart is cleared. On failure, the API's error message is surfaced.

### 4. Past Orders & Detail Flow
13. User clicks "See Past Orders" → a modal fetches `GET /orders` and shows only `complete` orders.
14. User can filter the list by customer email (case-insensitive, trimmed).
15. Clicking a row navigates to `/orders/:orderId`.
16. OrderDetail fetches `GET /orders/:order_id` (items included) and renders a line-item table with quantities, unit prices, subtotals, and the order total.

## Feature Requirements

### Core Features

**F1: Product Catalog**
- API: `GET /products` (optional `?category=` and `?sort=asc|desc` by price)
- UI: responsive ProductGrid of ProductCard components (image, name, price, rating stars)
- Fallback handling for a missing `image_url`

**F2: Category Filter & Search**
- SubNavbar exposes category selection and a search input
- Client-side narrowing of the loaded catalog (no re-fetch per keystroke)

**F3: Product Detail Page**
- Route: `/:productId`
- Shows full product info with add-to-cart controls

**F4: Shopping Cart**
- Sidebar cart tracks quantity per product as a `{ productId: quantity }` map
- Utilities: `addToCart`, `removeFromCart`, `getQuantityOfItemInCart`, `getTotalItemsInCart`
- Live running totals

**F5: Checkout / Order Creation**
- API: `POST /orders` with `{ customer_name, customer_email, status, items[] }`
- `total_price` is **computed server-side** — never trusted from the client
- Runs inside a Prisma `$transaction`; a missing product rolls the entire order back (404)
- On success, a receipt is rendered and the cart cleared

**F6: Past Orders**
- "See Past Orders" modal lists all `complete` orders (ID, email, date, total, status)
- Email filter narrows the list; "Show all orders" clears it; empty/no-match states handled

**F7: Order Detail**
- Route: `/orders/:orderId`, fetches the order with its items
- Renders a line-item table: item name, quantity, unit price, subtotal, and order total

**F8: Error & Loading States**
- Loading flags on every API call (`isFetching`, `isCheckingOut`)
- Friendly error messages ("Failed to load products. Is the backend running?")
- Consistent API error shape `{ "error": "message" }`

### Stretch Features (implemented)

- **S1: Extra Endpoints** — `GET /order-items` (all line items), `POST /orders/:order_id/items` (append a line item to an existing order, price captured server-side)
- **S2: Past Orders Page** — list view with order metadata, click-through to detail
- **S3: Email Filter** — filter past orders by customer email with clear/reset and no-results handling
- **S4: Not Found Route** — catch-all `*` route renders a NotFound view

### Not Yet Done
- **Deployment to Render** — `API_BASE_URL` currently points at `http://localhost:3000`; deployment requires environment-based config and is outstanding.

## Design Decisions

### Decision #1: Server-Computed Order Totals
| Option | Pros | Cons |
|---|---|---|
| **A: Compute total server-side (chosen)** | Trustworthy pricing; client can't tamper; prices captured at order time | Slightly more server logic |
| B: Accept `total_price` from client | Less server code | Insecure; client can send any total |

**Rationale:** The server loops the items, looks up each product, and sums `price × quantity`. The client's job is only to send `product_id` and `quantity`.

### Decision #2: Transactional Order Creation
| Option | Pros | Cons |
|---|---|---|
| **A: Single Prisma `$transaction` (chosen)** | Atomic; partial orders never persist; one bad item rolls everything back | All-or-nothing (intended) |
| B: Create order, then items separately | Simpler code | Orphaned orders / inconsistent state on failure |

**Rationale:** If any referenced product is missing, the transaction throws `PRODUCT_NOT_FOUND` and nothing is written; the API returns 404.

### Decision #3: Capture Price at Order Time
Each `OrderItem` stores the product's price **as of the moment the order was placed**, copied onto the line item. Later product price changes don't retroactively alter historical orders.

### Decision #4: Cart as a Quantity Map in `App`
Cart state lives at the top (`App`) as `{ productId: quantity }` and is lifted down via handlers. Single source of truth, simple totals, easy to clear on checkout. Tradeoff: cart is in-memory and resets on full page reload.

### Decision #5: Cascade Deletes at the Schema Level
`OrderItem` has `onDelete: Cascade` on both its `Order` and `Product` relations. Deleting either parent automatically removes the dependent line items — no manual cleanup in controllers.

### Decision #6: Multi-Page with React Router
Routes (`/`, `/:productId`, `/orders/:orderId`, `*`) give shareable URLs and working back-button navigation, and cleanly separate the store, detail, and order views.

## Component Architecture

### Frontend Hierarchy
- **App** — global state (`products`, `cart`, `userInfo`, `order`, loading/error flags); wraps everything in `BrowserRouter`
  - **Sidebar** — cart contents, user info inputs, checkout button, PastOrders entry
  - **SubNavbar** — category filter + search input
  - **Home** — ProductGrid → ProductCard (+ Stars)
  - **ProductDetail** (`/:productId`)
  - **PastOrders** — modal list of completed orders with email filter
  - **OrderDetail** (`/orders/:orderId`) — line-item table
  - **NotFound** (`*`)
  - **CheckoutSuccess** — receipt view after a successful order

### Backend Structure
```
server.js
 ├─ /products      → productRoute   → productController
 ├─ /orders        → orderRoute     → orderController
 └─ /order-items   → orderItemRoute → orderItemController
        │
        └─ Prisma Client → PostgreSQL
```

### Key Specifications

**App**
- State: `products`, `cart`, `userInfo {name, email, dorm_number}`, `order`, `activeCategory`, `searchInputValue`, `sidebarOpen`, `isFetching`, `isCheckingOut`, `error`
- Fetches products on mount; owns `handleOnCheckout` (maps cart → `items[]`, POSTs the order, builds the receipt)

**orderController.createOrder**
- Validates required fields and a non-empty `items[]`
- Wraps lookup + sum + create in `prisma.$transaction`
- Maps `PRODUCT_NOT_FOUND` → 404, all other failures → 500 with rollback

## Data Models

### Product
| Field | Type | Required | Default |
|---|---|---|---|
| id | Int | Required | `@id @default(autoincrement())` |
| name | String | Required | — |
| description | String | Optional | — |
| price | Float | Required | — |
| image_url | String | Optional | — |
| category | String | Required | — |

One Product → many OrderItems. Deleting a Product cascades to its OrderItems.

### Order
| Field | Type | Required | Default |
|---|---|---|---|
| order_id | Int | Required | `@id @default(autoincrement())` |
| customer_id | Int | Required | `@default(autoincrement())` |
| customer_name | String | Required | — |
| customer_email | String | Required | — |
| total_price | Float | Required | (computed server-side) |
| status | String | Required | — |
| created_at | DateTime | Required | `@default(now())` |

One Order → many OrderItems. Deleting an Order cascades to its OrderItems.

### OrderItem
| Field | Type | Required | Notes |
|---|---|---|---|
| order_item_id | Int | Required | `@id @default(autoincrement())` |
| order_id | Int | Required | FK → `Order.order_id` |
| product_id | Int | Required | FK → `Product.id` |
| quantity | Int | Required | — |
| price | Float | Required | captured at order time |

Belongs to one Order and one Product; cascade-deleted with either parent.

## API Contracts

Base URL: `http://localhost:3000` · Error shape (consistent): `{ "error": "message" }`

### Product Endpoints
| Method & Path | Purpose | Success | Errors |
|---|---|---|---|
| `GET /products` | List all (opt. `?category=`, `?sort=asc\|desc`) | 200 `[Product]` | 500 |
| `GET /products/:id` | One product | 200 `Product` | 404 |
| `POST /products` | Create (requires name, price, category) | 201 `Product` | 400, 500 |
| `PUT /products/:id` | Update | 200 `Product` | 400, 404, 500 |
| `DELETE /products/:id` | Delete (cascades items) | 200 `Product` | 404, 500 |

### Order Endpoints
| Method & Path | Purpose | Success | Errors |
|---|---|---|---|
| `GET /orders` | List all orders | 200 `[Order]` | 500 |
| `GET /orders/:order_id` | One order **with items** | 200 `Order{items}` | 404 |
| `POST /orders` | Create order (transactional, total computed) | 201 `Order{items}` | 400, 404, 500 |
| `POST /orders/:order_id/items` | Append a line item to an order | 201 `{orderItem}` | 400, 404, 500 |
| `PUT /orders/:order_id` | Update status | 200 `Order` | 404, 500 |
| `DELETE /orders/:order_id` | Delete order (cascades items) | 200 `Order` | 404, 500 |

### Order Item Endpoints
| Method & Path | Purpose | Success | Errors |
|---|---|---|---|
| `GET /order-items` | List every line item | 200 `{orderItems:[…]}` | 500 |

**`POST /orders` request body**
```json
{
  "customer_name": "Jane Doe",
  "customer_email": "jane@gmail.com",
  "status": "complete",
  "items": [ { "product_id": 3, "quantity": 2 } ]
}
```
`total_price` is **not** accepted from the client — it is computed from product prices server-side.

## State Architecture (App)

| Variable | Type | Default | Update Trigger | Used By |
|---|---|---|---|---|
| products | Product[] | `[]` | `GET /products` on mount | Home, ProductDetail, receipt |
| cart | `{id: qty}` | `{}` | add/remove handlers | Sidebar, Home, ProductDetail |
| userInfo | `{name,email,…}` | `{}` | Sidebar inputs | checkout |
| order | Order \| null | `null` | successful checkout | CheckoutSuccess |
| activeCategory | string | "All Categories" | SubNavbar | Home filter |
| searchInputValue | string | "" | search input | Home filter |
| isFetching | boolean | false | product fetch start/end | Home |
| isCheckingOut | boolean | false | checkout start/end | Sidebar |
| error | string \| null | null | any failure | Sidebar / pages |

## Testing & Validation Checklist

**Core**
- [x] Products load on mount and render in a responsive grid
- [x] Category filter and search narrow the displayed products
- [x] Add/remove updates cart quantities and totals
- [x] Checkout creates an order; total is computed server-side
- [x] `POST /orders` is atomic — a bad product rolls the order back (404)
- [x] Order item prices captured at order time
- [x] Past Orders modal lists completed orders; click opens detail
- [x] Email filter narrows orders; handles no-match and clear
- [x] OrderDetail shows line items, quantities, unit prices, subtotals, total
- [x] Deleting a Product/Order cascades to its OrderItems
- [x] Loading and error states display for all API calls

**Outstanding**
- [ ] Deployment to Render with environment-based `API_BASE_URL`

## Success Metrics

- **Functionality**: Full browse → cart → checkout → history loop works end-to-end.
- **Data Integrity**: Orders are atomic and pricing is authoritative server-side.
- **Code Quality**: Routes → controllers → Prisma separation; one responsibility per function.
- **UX**: Responsive layout, clear loading/error feedback, working navigation and back button.

## Learning Goals

- **Full-Stack Integration**: Wire a React client to an Express API over Axios.
- **Relational Modeling**: Model one-to-many relationships and cascade deletes in Prisma.
- **Transactional Correctness**: Use `$transaction` to keep order creation all-or-nothing.
- **REST Design**: Consistent endpoints, status codes, and error shapes.
- **State Management**: Lift shared state into `App` and pass handlers to children.

## Appendix: Key Decisions & Rationale

**Why Prisma + PostgreSQL?** Type-safe queries, declarative schema with migrations, and built-in relation/cascade handling over a robust relational database.

**Why compute totals server-side?** The client cannot be trusted to price an order; the server is the source of truth and captures prices at order time.

**Why a transaction for checkout?** An order and its items must persist together or not at all — `$transaction` guarantees that.

**Why React Router?** Shareable URLs, working back button, and clean separation between store, product, and order views.

## References
- Prisma Documentation: https://www.prisma.io/docs
- Express Documentation: https://expressjs.com
- React Router Documentation: https://reactrouter.com
