import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

async function seed() {
  try {
    console.log('🌱 Seeding database...\n')

    // Clear existing products so re-seeding is idempotent
    await prisma.product.deleteMany()

    // Load JSON data
    const productsData = JSON.parse(
      readFileSync(join(__dirname, 'data/products.json'), 'utf8')
    )

    // Seed products (preserve ids from the JSON file)
    for (const product of productsData.products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
        },
      })
    }

    console.log(`✅ Seeded ${productsData.products.length} products`)
    console.log('\n🎉 Seeding complete!')
  } catch (err) {
    console.error('❌ Error seeding:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
