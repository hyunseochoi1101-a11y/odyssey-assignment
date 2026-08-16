import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { desc, eq, isNull, sql } from 'drizzle-orm'
import {
  canTransition,
  type OrderStatus,
} from './order-status'
import { calculateOrderTotals } from './order-calculations'

import { createDb } from './db'
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orderingSettings,
  orders,
} from './db/schema'

import {
  createOrderBodySchema,
  createOrderResponseSchema,
  customerDetailParamsSchema,
  customerDetailResponseSchema,
  customersResponseSchema,
  menuItemParamsSchema,
  menuResponseSchema,
  ordersResponseSchema,
  settingsResponseSchema,
  summaryResponseSchema,
  updateMenuAvailabilityBodySchema,
  updateMenuAvailabilityResponseSchema,
  updateOrderStatusBodySchema,
  updateOrderStatusParamsSchema,
  updateOrderStatusResponseSchema,
  updateSettingsBodySchema,
  updateSettingsResponseSchema,
  updateMenuItemPrepTimeBodySchema,
  updateMenuItemPrepTimeResponseSchema,
  orderDetailParamsSchema,
  orderDetailResponseSchema,
  createMenuItemBodySchema,
  createMenuItemResponseSchema,
  updateMenuItemBodySchema,
  updateMenuItemResponseSchema,
  createCustomerBodySchema,
  createCustomerResponseSchema,
} from './schemas'

type Bindings = {
  DATABASE_URL: string
}

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: 'http://localhost:8081',
  })
)

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}

app.get('/', (c) => {
  return c.json({ message: 'Odyssey backend is running' })
})

const menuRoute = createRoute({
  method: 'get',
  path: '/menu',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: menuResponseSchema,
        },
      },
      description: 'Restaurant menu',
    },
  },
})

app.openapi(menuRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const categories = await db.select().from(menuCategories)
  const items = await db.select().from(menuItems)

  return c.json({
    categories: categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id),
    })),
  })
})

const createMenuItemRoute = createRoute({
  method: 'post',
  path: '/menu/items',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createMenuItemBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createMenuItemResponseSchema,
        },
      },
      description: 'Menu item created',
    },
    400: {
      description: 'Invalid menu item',
    },
  },
})

app.openapi(createMenuItemRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const body = c.req.valid('json')

  const [category] = await db
    .select({
      id: menuCategories.id,
    })
    .from(menuCategories)
    .where(eq(menuCategories.id, body.categoryId))
    .limit(1)

  if (!category) {
    return c.json(
      {
        error: 'Menu category not found',
      },
      400
    )
  }

  const [newItem] = await db
    .insert(menuItems)
    .values({
      categoryId: body.categoryId,
      name: body.name.trim(),
      description: body.description,
      priceCents: body.priceCents,
      prepTimeMinutes: body.prepTimeMinutes,
      isAvailable: body.isAvailable,
    })
    .returning()

  return c.json(
    {
      item: newItem,
    },
    201
  )
})

const updateMenuAvailabilityRoute = createRoute({
  method: 'patch',
  path: '/menu/items/{id}/availability',
  request: {
    params: menuItemParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateMenuAvailabilityBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateMenuAvailabilityResponseSchema,
        },
      },
      description: 'Menu item availability updated',
    },
    404: {
      description: 'Menu item not found',
    },
  },
})

app.openapi(updateMenuAvailabilityRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const { isAvailable } = c.req.valid('json')

  const itemId = Number(id)

  const [existingItem] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, itemId))
    .limit(1)

  if (!existingItem) {
    return c.json(
      {
        error: 'Menu item not found',
      },
      404
    )
  }

  const [updatedItem] = await db
    .update(menuItems)
    .set({
      isAvailable,
    })
    .where(eq(menuItems.id, itemId))
    .returning()

  return c.json({
    item: updatedItem,
  })
})

const updateMenuItemPrepTimeRoute = createRoute({
  method: 'patch',
  path: '/menu/items/{id}/prep-time',
  request: {
    params: menuItemParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateMenuItemPrepTimeBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateMenuItemPrepTimeResponseSchema,
        },
      },
      description: 'Menu item prep time updated',
    },
    404: {
      description: 'Menu item not found',
    },
  },
})

app.openapi(updateMenuItemPrepTimeRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const { prepTimeMinutes } = c.req.valid('json')

  const itemId = Number(id)

  const [existingItem] = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, itemId))
    .limit(1)

  if (!existingItem) {
    return c.json(
      {
        error: 'Menu item not found',
      },
      404
    )
  }

  const [updatedItem] = await db
    .update(menuItems)
    .set({
      prepTimeMinutes,
    })
    .where(eq(menuItems.id, itemId))
    .returning()

  return c.json({
    item: updatedItem,
  })
})

const updateMenuItemRoute = createRoute({
  method: 'patch',
  path: '/menu/items/{id}',
  request: {
    params: menuItemParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateMenuItemBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateMenuItemResponseSchema,
        },
      },
      description: 'Menu item updated',
    },
    400: {
      description: 'Invalid menu item',
    },
    404: {
      description: 'Menu item not found',
    },
  },
})

app.openapi(updateMenuItemRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const itemId = Number(id)

  const [existingItem] = await db
    .select({
      id: menuItems.id,
    })
    .from(menuItems)
    .where(eq(menuItems.id, itemId))
    .limit(1)

  if (!existingItem) {
    return c.json(
      {
        error: 'Menu item not found',
      },
      404
    )
  }

  const [category] = await db
    .select({
      id: menuCategories.id,
    })
    .from(menuCategories)
    .where(eq(menuCategories.id, body.categoryId))
    .limit(1)

  if (!category) {
    return c.json(
      {
        error: 'Menu category not found',
      },
      400
    )
  }

  const [updatedItem] = await db
    .update(menuItems)
    .set({
      categoryId: body.categoryId,
      name: body.name.trim(),
      description: body.description,
      priceCents: body.priceCents,
      prepTimeMinutes: body.prepTimeMinutes,
      isAvailable: body.isAvailable,
    })
    .where(eq(menuItems.id, itemId))
    .returning()

  return c.json({
    item: updatedItem,
  })
})

const ordersRoute = createRoute({
  method: 'get',
  path: '/orders',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ordersResponseSchema,
        },
      },
      description: 'Order list',
    },
  },
})

app.openapi(ordersRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const rows = await db
  .select({
    id: orders.id,
    status: orders.status,
    totalCents: orders.totalCents,
    estimatedPrepTimeMinutes:
      orders.estimatedPrepTimeMinutes,
    createdAt: orders.createdAt,
    customerId: customers.id,
    customerName: customers.name,
  })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt))

  return c.json({ orders: rows })
})

const orderDetailRoute = createRoute({
  method: 'get',
  path: '/orders/{id}',
  request: {
    params: orderDetailParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: orderDetailResponseSchema,
        },
      },
      description: 'Order details',
    },
    404: {
      description: 'Order not found',
    },
  },
})

app.openapi(orderDetailRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const orderId = Number(id)

  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      estimatedPrepTimeMinutes:
        orders.estimatedPrepTimeMinutes,
      createdAt: orders.createdAt,
      customerId: customers.id,
      customerName: customers.name,
    })
    .from(orders)
    .leftJoin(
      customers,
      eq(orders.customerId, customers.id)
    )
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) {
    return c.json(
      {
        error: 'Order not found',
      },
      404
    )
  }

  const items = await db
    .select({
      id: orderItems.id,
      menuItemId: orderItems.menuItemId,
      name: menuItems.name,
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
    })
    .from(orderItems)
    .innerJoin(
      menuItems,
      eq(orderItems.menuItemId, menuItems.id)
    )
    .where(eq(orderItems.orderId, orderId))

  return c.json({
    order: {
      ...order,

      items: items.map((item) => ({
        ...item,
        lineTotalCents:
          item.unitPriceCents * item.quantity,
      })),
    },
  })
})

const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createOrderBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createOrderResponseSchema,
        },
      },
      description: 'Order created',
    },
    400: {
      description: 'Invalid order',
    },
  },
})

app.openapi(createOrderRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const body = c.req.valid('json')

  if (body.customerId !== null) {
    const [customer] = await db
      .select({
        id: customers.id,
      })
      .from(customers)
      .where(eq(customers.id, body.customerId))
      .limit(1)

    if (!customer) {
      return c.json(
        {
          error: 'Customer not found',
        },
        400
      )
    }
  }

  const requestedItemIds = body.items.map(
    (item) => item.menuItemId
  )

  const allMenuItems = await db
    .select()
    .from(menuItems)

  const requestedMenuItems = allMenuItems.filter((item) =>
    requestedItemIds.includes(item.id)
  )

  if (requestedMenuItems.length !== requestedItemIds.length) {
    return c.json(
      {
        error: 'One or more menu items do not exist',
      },
      400
    )
  }

  const unavailableItem = requestedMenuItems.find(
    (item) => !item.isAvailable
  )

  if (unavailableItem) {
    return c.json(
      {
        error: `${unavailableItem.name} is unavailable`,
      },
      400
    )
  }

let totalCents: number
let estimatedPrepTimeMinutes: number

try {
  const totals = calculateOrderTotals(
    requestedMenuItems,
    body.items
  )

  totalCents = totals.totalCents
  estimatedPrepTimeMinutes =
    totals.estimatedPrepTimeMinutes
} catch {
  return c.json(
    {
      error: 'Menu item not found',
    },
    400
  )
}

  const [settings] = await db
  .select({
    autoAcceptOrders: orderingSettings.autoAcceptOrders,
    orderingEnabled: orderingSettings.orderingEnabled,
  })
  .from(orderingSettings)
  .limit(1)

if (settings?.orderingEnabled === false) {
  return c.json(
    {
      error: 'Ordering is currently disabled',
    },
    400
  )
}

const initialStatus =
  settings?.autoAcceptOrders === true
    ? 'accepted'
    : 'pending'

const [newOrder] = await db
  .insert(orders)
  .values({
    customerId: body.customerId,
    totalCents,
    estimatedPrepTimeMinutes,
    status: initialStatus,
  })
  .returning()

  await db.insert(orderItems).values(
    body.items.map((requestedItem) => {
      const menuItem = requestedMenuItems.find(
        (item) => item.id === requestedItem.menuItemId
      )!

      return {
        orderId: newOrder.id,
        menuItemId: menuItem.id,
        quantity: requestedItem.quantity,
        unitPriceCents: menuItem.priceCents,
      }
    })
  )

  return c.json(
    {
      order: {
        id: newOrder.id,
        customerId: newOrder.customerId,
        status: newOrder.status,
        totalCents: newOrder.totalCents,
        createdAt: newOrder.createdAt,
      },
    },
    201
  )
})

const customersRoute = createRoute({
  method: 'get',
  path: '/customers',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: customersResponseSchema,
        },
      },
      description: 'Customer CRM list',
    },
  },
})

app.openapi(customersRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpendCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
    })
    .from(customers)
    .leftJoin(orders, eq(customers.id, orders.customerId))
    .groupBy(customers.id)

    const [guestStats] = await db
  .select({
    orderCount: sql<number>`count(${orders.id})`,
    totalSpendCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
  })
  .from(orders)
  .where(isNull(orders.customerId))

const guestCustomer = {
  id: 0,
  name: 'Guest',
  email: null,
  phone: null,
  orderCount: Number(guestStats?.orderCount ?? 0),
  totalSpendCents: Number(
    guestStats?.totalSpendCents ?? 0
  ),
}

  return c.json({
  customers: [guestCustomer, ...rows],
})
})

const createCustomerRoute = createRoute({
  method: 'post',
  path: '/customers',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCustomerBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createCustomerResponseSchema,
        },
      },
      description: 'Customer created',
    },
    400: {
      description: 'Invalid customer',
    },
  },
})

app.openapi(createCustomerRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const body = c.req.valid('json')

  const [newCustomer] = await db
    .insert(customers)
    .values({
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
    })
    .returning()

  return c.json(
    {
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        orderCount: 0,
        totalSpendCents: 0,
      },
    },
    201
  )
})

const customerDetailRoute = createRoute({
  method: 'get',
  path: '/customers/{id}',
  request: {
    params: customerDetailParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: customerDetailResponseSchema,
        },
      },
      description: 'Customer details and recent orders',
    },
    404: {
      description: 'Customer not found',
    },
  },
})

app.openapi(customerDetailRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const customerId = Number(id)

  if (customerId === 0) {
  const guestOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(isNull(orders.customerId))
    .orderBy(desc(orders.createdAt))

  const totalSpendCents = guestOrders.reduce(
    (total, order) => total + order.totalCents,
    0
  )

  return c.json({
    customer: {
      id: 0,
      name: 'Guest',
      email: null,
      phone: null,
      orderCount: guestOrders.length,
      totalSpendCents,
      recentOrders: guestOrders,
    },
  })
}

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1)

  if (!customer) {
    return c.json(
      {
        error: 'Customer not found',
      },
      404
    )
  }

  const customerOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))

  const totalSpendCents = customerOrders.reduce(
    (total, order) => total + order.totalCents,
    0
  )

  return c.json({
    customer: {
      ...customer,
      orderCount: customerOrders.length,
      totalSpendCents,
      recentOrders: customerOrders,
    },
  })
})

const settingsRoute = createRoute({
  method: 'get',
  path: '/settings',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: settingsResponseSchema,
        },
      },
      description: 'Ordering settings',
    },
  },
})

app.openapi(settingsRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const rows = await db.select().from(orderingSettings).limit(1)

  return c.json({
    settings: rows[0] ?? null,
  })
})

const updateSettingsRoute = createRoute({
  method: 'put',
  path: '/settings',
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateSettingsBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateSettingsResponseSchema,
        },
      },
      description: 'Updated ordering settings',
    },
  },
})

app.openapi(updateSettingsRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const body = c.req.valid('json')

  const [existingSettings] = await db
    .select()
    .from(orderingSettings)
    .limit(1)

  let updatedSettings

  if (existingSettings) {
    ;[updatedSettings] = await db
      .update(orderingSettings)
      .set({
        restaurantName: body.restaurantName,
        prepTimeMinutes: body.prepTimeMinutes,
        autoAcceptOrders: body.autoAcceptOrders,
        orderingEnabled: body.orderingEnabled,
      })
      .where(eq(orderingSettings.id, existingSettings.id))
      .returning()
  } else {
    ;[updatedSettings] = await db
      .insert(orderingSettings)
      .values({
        restaurantName: body.restaurantName,
        prepTimeMinutes: body.prepTimeMinutes,
        autoAcceptOrders: body.autoAcceptOrders,
        orderingEnabled: body.orderingEnabled,
      })
      .returning()
  }

  return c.json({
    settings: updatedSettings,
  })
})

const summaryRoute = createRoute({
  method: 'get',
  path: '/summary',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: summaryResponseSchema,
        },
      },
      description: 'Dashboard summary',
    },
  },
})

app.openapi(summaryRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const [summary] = await db
    .select({
      totalOrders: sql<number>`count(${orders.id})`,
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
      pendingOrders: sql<number>`
        count(*) filter (where ${orders.status} = 'pending')
      `,
    })
    .from(orders)

  const popularItems = await db
    .select({
      name: menuItems.name,
      quantitySold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .groupBy(menuItems.id)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5)

  return c.json({
    ...summary,
    popularItems,
  })
})

const updateOrderStatusRoute = createRoute({
  method: 'patch',
  path: '/orders/{id}/status',
  request: {
    params: updateOrderStatusParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateOrderStatusBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateOrderStatusResponseSchema,
        },
      },
      description: 'Order status updated',
    },
    400: {
      description: 'Invalid order status transition',
    },
    404: {
      description: 'Order not found',
    },
  },
})

app.openapi(updateOrderStatusRoute, async (c) => {
  const db = createDb(c.env.DATABASE_URL)

  const { id } = c.req.valid('param')
  const { status } = c.req.valid('json')

  const orderId = Number(id)

  if (!Number.isInteger(orderId)) {
    return c.json(
      {
        error: 'Invalid order id',
      },
      400
    )
  }

  const [existingOrder] = await db
    .select({
      id: orders.id,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!existingOrder) {
    return c.json(
      {
        error: 'Order not found',
      },
      404
    )
  }

  const currentStatus =
  existingOrder.status as OrderStatus

const nextStatus =
  status as OrderStatus

if (!canTransition(currentStatus, nextStatus)) {
  return c.json(
    {
      error: 'Invalid order status transition',
    },
    400
  )
}

  const [updatedOrder] = await db
    .update(orders)
    .set({
      status: nextStatus,
    })
    .where(eq(orders.id, orderId))
    .returning({
      id: orders.id,
      status: orders.status,
    })

  return c.json({
    id: updatedOrder.id,
    status: updatedOrder.status,
  })
})

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Odyssey Restaurant API',
  },
})

export default app