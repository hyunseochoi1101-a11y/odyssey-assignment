import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  orderingSettings,
} from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing')
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

async function seed() {
  console.log('Seeding database...')

  await db.delete(orderItems)
  await db.delete(orders)
  await db.delete(menuItems)
  await db.delete(menuCategories)
  await db.delete(customers)
  await db.delete(orderingSettings)

  const categories = await db
    .insert(menuCategories)
    .values([
      { name: 'Burgers' },
      { name: 'Sides' },
      { name: 'Drinks' },
      { name: 'Desserts' },
    ])
    .returning()

  const burgers = categories.find((c) => c.name === 'Burgers')!
  const sides = categories.find((c) => c.name === 'Sides')!
  const drinks = categories.find((c) => c.name === 'Drinks')!
  const desserts = categories.find((c) => c.name === 'Desserts')!

  const items = await db
    .insert(menuItems)
    .values([
      {
        categoryId: burgers.id,
        name: 'Classic Burger',
        description: 'Beef patty, lettuce, tomato, house sauce',
        priceCents: 1299,
        isAvailable: true,
      },
      {
        categoryId: burgers.id,
        name: 'Spicy Chicken Burger',
        description: 'Crispy chicken, pickles, spicy mayo',
        priceCents: 1399,
        isAvailable: true,
      },
      {
        categoryId: burgers.id,
        name: 'Double Cheeseburger',
        description: 'Two beef patties and American cheese',
        priceCents: 1599,
        isAvailable: true,
      },
      {
        categoryId: sides.id,
        name: 'French Fries',
        description: 'Crispy salted fries',
        priceCents: 499,
        isAvailable: true,
      },
      {
        categoryId: sides.id,
        name: 'Onion Rings',
        description: 'Crispy battered onion rings',
        priceCents: 599,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: 'Cola',
        description: 'Chilled cola',
        priceCents: 299,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: 'Lemonade',
        description: 'Fresh lemonade',
        priceCents: 399,
        isAvailable: true,
      },
      {
        categoryId: desserts.id,
        name: 'Chocolate Brownie',
        description: 'Warm chocolate brownie',
        priceCents: 599,
        isAvailable: true,
      },
    ])
    .returning()

  const customerRows = await db
    .insert(customers)
    .values([
      {
        name: 'Alex Kim',
        email: 'alex@example.com',
        phone: '010-1111-1111',
      },
      {
        name: 'Jamie Lee',
        email: 'jamie@example.com',
        phone: '010-2222-2222',
      },
      {
        name: 'Jordan Park',
        email: 'jordan@example.com',
        phone: '010-3333-3333',
      },
    ])
    .returning()

  const classicBurger = items.find((i) => i.name === 'Classic Burger')!
  const fries = items.find((i) => i.name === 'French Fries')!
  const cola = items.find((i) => i.name === 'Cola')!
  const chickenBurger = items.find(
    (i) => i.name === 'Spicy Chicken Burger'
  )!

  const createdOrders = await db
    .insert(orders)
    .values([
      {
        customerId: customerRows[0].id,
        status: 'pending',
        totalCents: classicBurger.priceCents + fries.priceCents,
      },
      {
        customerId: customerRows[1].id,
        status: 'preparing',
        totalCents: chickenBurger.priceCents + cola.priceCents,
      },
      {
        customerId: customerRows[0].id,
        status: 'completed',
        totalCents: classicBurger.priceCents * 2 + cola.priceCents,
      },
    ])
    .returning()

  await db.insert(orderItems).values([
    {
      orderId: createdOrders[0].id,
      menuItemId: classicBurger.id,
      quantity: 1,
      unitPriceCents: classicBurger.priceCents,
    },
    {
      orderId: createdOrders[0].id,
      menuItemId: fries.id,
      quantity: 1,
      unitPriceCents: fries.priceCents,
    },
    {
      orderId: createdOrders[1].id,
      menuItemId: chickenBurger.id,
      quantity: 1,
      unitPriceCents: chickenBurger.priceCents,
    },
    {
      orderId: createdOrders[1].id,
      menuItemId: cola.id,
      quantity: 1,
      unitPriceCents: cola.priceCents,
    },
    {
      orderId: createdOrders[2].id,
      menuItemId: classicBurger.id,
      quantity: 2,
      unitPriceCents: classicBurger.priceCents,
    },
    {
      orderId: createdOrders[2].id,
      menuItemId: cola.id,
      quantity: 1,
      unitPriceCents: cola.priceCents,
    },
  ])

  await db.insert(orderingSettings).values({
    restaurantName: 'Odyssey Kitchen',
    prepTimeMinutes: 20,
    autoAcceptOrders: false,
    orderingEnabled: true,
  })

  console.log('Seed complete.')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
