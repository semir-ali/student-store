import prisma from '../db/db.js'

// Product model: wraps Prisma Client calls for the Product table.
// Each method maps to one CRUD operation used by the /products routes.
class Product {
  // READ all — supports optional `category` filter and `sort` by price.
  // GET /products  (query params: category, sort)
  static async list({ category, sort } = {}) {
    return prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: sort ? { price: sort === 'desc' ? 'desc' : 'asc' } : undefined,
    })
  }

  // READ one by id — returns null if not found.
  // GET /products/:id
  static async get(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
    })
  }

  // CREATE — expects { name, description, price, image_url, category }.
  // POST /products
  static async create({ name, description, price, image_url, category }) {
    return prisma.product.create({
      data: {
        name,
        description,
        price,
        image_url,
        category,
      },
    })
  }

  // UPDATE by id — replaces the provided fields.
  // PUT /products/:id
  static async update(id, { name, description, price, image_url, category }) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price,
        image_url,
        category,
      },
    })
  }

  // DELETE by id — returns the deleted record.
  // DELETE /products/:id
  static async remove(id) {
    return prisma.product.delete({
      where: { id: Number(id) },
    })
  }
}

export default Product
