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
  Body Example: { "error": "Product in Order is not found" }
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
The entire flow below runs inside a single Prisma `$transaction` so it is atomic:
if any step fails (e.g. a product is not found), every change is rolled back and
no Order or OrderItem rows are persisted.

When POST /orders is requested by the user, the following should happen:
1. The request body should contain the fields customer_name, customer_email, status, and items[] (each item containing product_id and quantity). total_price is NOT accepted from the client — it is computed server-side in step 3. If customer_name, customer_email, status, or a non-empty items[] is missing, return a 400 with { "error": "Missing required fields: ..." }.
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
3. Determine total_price by looping through each item: use prisma to find the product for that product_id. If the product is not found, throw to roll back the transaction and return a 404 with { "error": "Product in Order is not found" }. If found, capture the product's current price onto the OrderItem and add (product.price * quantity) to the running total_price.
4. Calculate the total price and, if all products are in the order, return a 201 code indicating its success and return the Order (with its items included) back to the user, being
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

## Spec Reconciliation — Milestone 4 (Schema Audit)

### Schema vs. spec gaps found
Schema fit spec completely and there were no gaps!

### Cascade delete verification
- Deleting a Product removes associated OrderItems: ✅ tested
- Deleting an Order removes associated OrderItems: ✅ tested

## Decisions Log — Order Creation Transaction

- **What my Transactional Flow spec got right**: 
The logic for actually adding the total price was correct and using prisma's transaction successfully handled the case where an error with a product item wouldn't result in a total price

- **What the spec missed that I discovered during implementation**: I did not handle the case where an OrderItem has undefined behavior (i.e. the quantity of the item is undefined)

- **How the transaction error handling works**: If any item inside of an Order does not exist, then the total_price operations are cancelled for Prisma. The program then throws a 404 error to the user (since the Product associated with the item does not exist)

- **One thing I'd design differently if starting over**: I would try to cover all potential edge cases and put sample Postman requests for them before starting to code. It would make the high-level coding for the requests a lot easier since I would know all the cases I should consider.