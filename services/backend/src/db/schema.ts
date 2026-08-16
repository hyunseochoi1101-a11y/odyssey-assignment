import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
])

export const menuCategories = pgTable('menu_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
})

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),

  categoryId: integer('category_id')
    .notNull()
    .references(() => menuCategories.id),

  name: text('name').notNull(),

  description: text('description'),

  priceCents: integer('price_cents').notNull(),

  prepTimeMinutes: integer('prep_time_minutes')
    .notNull()
    .default(10),

  isAvailable: boolean('is_available')
    .notNull()
    .default(true),
})

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),

  customerId: integer('customer_id').references(
    () => customers.id
  ),

  status: orderStatusEnum('status')
    .notNull()
    .default('pending'),

  totalCents: integer('total_cents').notNull(),

  estimatedPrepTimeMinutes: integer(
    'estimated_prep_time_minutes'
  )
    .notNull()
    .default(0),

  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  menuItemId: integer('menu_item_id')
    .notNull()
    .references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
})

export const orderingSettings = pgTable('ordering_settings', {
  id: serial('id').primaryKey(),
  restaurantName: text('restaurant_name').notNull().default('Odyssey Kitchen'),
  prepTimeMinutes: integer('prep_time_minutes').notNull().default(20),
  autoAcceptOrders: boolean('auto_accept_orders').notNull().default(false),
  orderingEnabled: boolean('ordering_enabled').notNull().default(true),
})
