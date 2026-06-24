#### Data Models
Product:
Field | Prisma Data Type | Required or Optional | Default Value
id | Int | Required | @id @default(autoincrement())
name | String | Required | N/A
description | String | Optional | N/A
price | Float | Required | N/A
image_url | String | Optional | N/A
category | String | Required | N/A

Primary Key Field: id (autoincrements)
Relationships: One Product -> many OrderItems (one to many)
Foreign Keys: N/A
Cascade Delete Rules: If a product is deleted, any OrderItems referencing it are also deleted

Orders:
Field | Prisma Data Type | Required or Optional | Default Value
order_id | Int | Required | @id @default(autoincrement())
customer_name | String | Required | N/A
customer_email | String | Required | N/A
total_price | Float | Required | N/A
status | String (completed/pending/cancelled) | Required | N/A
created_at | DateTime | Required | @default(now())

Primary Key Field: order_id (autoincrements)
Relationships: One Order -> many OrderItems (one to many)
Foreign Keys: N/A
Cascade Delete Rules: If an order is deleted, any OrderItems referencing its product_id are also deleted

OrderItems:
Field | Prisma Data Type | Required or Optional | Default Value
order_item_id | Int | Required | @id @default(autoincrement())
order_id | Int | Required | N/A (foreign key -> Order.order_id)
product_id | Int | Required | N/A (foreign key -> Product.id)
quantity | Int | Required | N/A
price | Float | Required | N/A

Primary Key Field: order_item_id (autoincrements)
Relationships: Belongs to one Order (order_id -> Order.order_id), Belongs to one Product (product_id -> Product.id)
Foreign Keys: order_id, product_id
Cascade Delete Rules: Deleted when parent Order is deleted, Deleted when parent Product is deleted

#### API Contracts
Error Response Shape (consistent across all endpoints):
{ "error": "message" }

Product Endpoints:

GET /products
- HTTP Method & Path: GET /products
- Body: N/A
- Request Params: N/A
- Query Params: category, sort (optional -> default behavior for no provided parameters is returning all items unsorted)
- Success Response:
  Status: 200
  Body Example: [ { "id": 1, "name": "Hoodie", "description": "...", "price": 39.99, "image_url": "...", "category": "clothing" } ]
- Error Case:
  Status: 500
  Body Example: { "error": "Failed to fetch products" }

GET /products/:id
- HTTP Method & Path: GET /products/:id
- Body: N/A
- Request Params: id
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "id": 1, "name": "Hoodie", "description": "...", "price": 39.99, "image_url": "...", "category": "clothing" }
- Error Case:
  Status: 404
  Body Example: { "error": "Product not found" }

POST /products
- HTTP Method & Path: POST /products
- Body Example: {"name": "CodePath Hoodie", "description": "...", "price": "39.99", "image_url": "...", "category": "clothing"}
- Request Params: N/A
- Query Params: N/A
- Success Response:
  Status: 201
  Body Example: {
  "id": 1,
  "name": "CodePath Hoodie",
  "description": "A cozy hoodie",
  "price": 39.99,
  "image_url": "https://example.com/hoodie.png",
  "category": "clothing"
}
- Error Case:
  Status: 400
  Body Example: { "error": "Missing required fields: name, price" }
- Error Case: 
  Status: 500
  Body Example: {"error": "Failed to create product" }

PUT /products/:id
- HTTP Method & Path: PUT /products/:id
- Body: {"name": "CodePath Hoodie", "description": "...", "price": "39.99", "image_url": "...", "category": "clothing"}
- Request Params: id
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "id": 1, "name": "Hoodie", "description": "...", "price": 39.99, "image_url": "...", "category": "clothing" }
- Error Case:
  Status: 404
  Body Example: { "error": "Product not found" }
- Error Case:
  Status: 400
  Body Example: { "error": "Missing required fields: name, price" }

DELETE /products/:id
- HTTP Method & Path: DELETE /products/:id
- Body: N/A
- Request Params: id
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "id": 1, "name": "Hoodie", "description": "...", "price": 39.99, "image_url": "...", "category": "clothing" }
- Error Case:
  Status: 404
  Body Example: { "error": "Product not found" }
- Error Case:
  Status: 500
  Body Example: { "error": "Database failed to update" }

Order Endpoints:

GET /orders
- HTTP Method & Path: GET /orders
- Body: N/A
- Request Params: N/A
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: [ { "order_id": 1, "customer_name": "Jane Doe", "customer_email": "jane@gmail.com", "total_price": 49.98, "status": "pending", "created_at": "2026-06-22T00:00:00.000Z" } ]
- Error Case:
  Status: 500
  Body Example: { "error": "Failed to fetch orders" }

GET /orders/:order_id
- HTTP Method & Path: GET /orders/:order_id
- Body: N/A
- Request Params: order_id (Int)
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "order_id": 1, "customer_name": "Jane Doe", "customer_email": "jane@gmail.com", "total_price": 49.98, "status": "pending", "created_at": "2026-06-22T00:00:00.000Z", "items": [ { "order_item_id": 1, "product_id": 3, "quantity": 2, "price": 24.99 } ] }
- Error Case:
  Status: 404
  Body Example: { "error": "Order not found" }

POST /orders
- HTTP Method & Path: POST /orders
- Request Params: N/A
- Query Params: N/A
- Success Response:
  Status: 201
  Includes the created order AND its associated order items
  Body Example:
  {
    "order_id": 1,
    "customer_name": "Jane Doe",
    "customer_email": "jane@gmail.com",
    "total_price": 64.97,
    "status": "pending",
    "created_at": "2026-06-22T00:00:00.000Z",
    "items": [
      { "order_item_id": 1, "product_id": 3, "quantity": 2, "price": 24.99 },
      { "order_item_id": 2, "product_id": 7, "quantity": 1, "price": 14.99 }
    ]
  }
- Error Case:
  Status: 400
  Body Example: { "error": "Missing required fields: customer_name, customer_email, items" }
- Error Case:
  Status: 404
  Body Example: { "error": "Product not found" }
- Error Case:
  Status: 500
  Body Example: { "error": "Failed to create order, transaction rolled back" }

PUT /orders/:order_id
- HTTP Method & Path: PUT /orders/:order_id
- Body Example: { "status": "completed" }
- Request Params: order_id 
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "order_id": 1, "customer_name": "Jane Doe", "customer_email": "jane@gmail.com", "total_price": 49.98, "status": "completed", "created_at": "2026-06-22T00:00:00.000Z" }
- Error Case:
  Status: 404
  Body Example: { "error": "Order not found" }

DELETE /orders/:order_id
- HTTP Method & Path: DELETE /orders/:order_id
- Body: N/A
- Request Params: order_id 
- Query Params: N/A
- Success Response:
  Status: 200
  Body Example: { "order_id": 1, "customer_name": "Jane Doe", "customer_email": "jane@gmail.com", "total_price": 49.98, "status": "pending", "created_at": "2026-06-22T00:00:00.000Z" }
- Error Case:
  Status: 404
  Body Example: { "error": "Order not found" }

#### Transactional Flow
When POST /orders is requested by the user, the following should happen:
1. The request body should contain the fields customer_id, customer_name, status, items[] (containing product_id, quantity), and customer_email
2. Create the Order row, which contains information about the Order:
{
    "order_id": 1 (auto-generated),
    "customer_name": "Jane Doe",
    "customer_email": "jane@gmail.com",
    "total_price": 64.97,
    "status": "pending",
    "created_at": "2026-06-22T00:00:00.000Z",
    "items": [
      { "order_item_id": 1, "product_id": 3, "quantity": 2, "price": 24.99 },
      { "order_item_id": 2, "product_id": 7, "quantity": 1, "price": 14.99 }
    ]
  }
3. Determine what the total_price is by looping through each item and seeing if its product_id is there and, if so, adding it to the total_price, if not return a 404 error (returning the body {"error": "Product in Order is not found"}); use prisma to find the product associated with the product_id.
4. Calculate the total price and, if all products are in the order return a 201 code indicating its success and return the Order back to the user, being
{
    "order_id": 1 (auto-generated),
    "customer_name": "Jane Doe",
    "customer_email": "jane@gmail.com",
    "total_price": 64.97,
    "status": "pending",
    "created_at": "2026-06-22T00:00:00.000Z",
    "items": [
      { "order_item_id": 1, "product_id": 3, "quantity": 2, "price": 24.99 },
      { "order_item_id": 2, "product_id": 7, "quantity": 1, "price": 14.99 }
    ]
  }

## Decisions Log — Product Model

- **Schema translation that went smoothly**: All the ids successfully incremented for each POST request, the names/description/image/category all translated well into strings, and price was translated well into a float

- **Field decision I made during implementation that wasn't in the original spec**: For error handling when POST requests don't have a specific required field (i.e. category), I made it such that this specific field is returned back into the user and I updated the logic for the error behavior for delete such that it also included error handling for PUT requests if the Product updated does not exist

- **Route behavior that needed a spec update**: For the above two field changes, I needed to include relevant error codes for the failed request. For the POST request not having a category this is 400 (Bad Request) and for the PUT request, this is 404 (Not Found).