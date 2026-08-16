import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod'

import {
  customers,
  menuCategories,
  menuItems,
  orderingSettings,
} from './db/schema'

export const menuCategorySchema =
  createSelectSchema(menuCategories)

export const menuItemSchema =
  createSelectSchema(menuItems)

export const menuItemParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
  }),
})

export const updateMenuAvailabilityBodySchema =
  z.object({
    isAvailable: z.boolean(),
  })

export const updateMenuAvailabilityResponseSchema =
  z.object({
    item: menuItemSchema,
  })

export const updateMenuItemPrepTimeBodySchema = z.object({
  prepTimeMinutes: z.number().int().min(1).max(240),
})

export const updateMenuItemPrepTimeResponseSchema = z.object({
  item: menuItemSchema,
})

export const createMenuItemBodySchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullable(),
  priceCents: z.number().int().positive(),
  prepTimeMinutes: z.number().int().min(1).max(240),
  isAvailable: z.boolean(),
})

export const createMenuItemResponseSchema = z.object({
  item: menuItemSchema,
})

export const updateMenuItemBodySchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullable(),
  priceCents: z.number().int().positive(),
  prepTimeMinutes: z.number().int().min(1).max(240),
  isAvailable: z.boolean(),
})

export const updateMenuItemResponseSchema = z.object({
  item: menuItemSchema,
})

export const customerSchema =
  createSelectSchema(customers)

export const orderingSettingsSchema =
  createSelectSchema(orderingSettings)

export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
])

export const menuResponseSchema = z.object({
  categories: z.array(
    menuCategorySchema.extend({
      items: z.array(menuItemSchema),
    })
  ),
})

export const ordersResponseSchema = z.object({
  orders: z.array(
    z.object({
      id: z.number(),
      status: orderStatusSchema,
      totalCents: z.number(),
      estimatedPrepTimeMinutes: z.number(),
      createdAt: z.string().or(z.date()),
      customerId: z.number().nullable(),
      customerName: z.string().nullable(),
    })
  ),
})

export const orderDetailParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
  }),
})

export const orderDetailResponseSchema = z.object({
  order: z.object({
    id: z.number(),
    status: orderStatusSchema,
    totalCents: z.number(),
    estimatedPrepTimeMinutes: z.number(),
    createdAt: z.string().or(z.date()),
    customerId: z.number().nullable(),
    customerName: z.string().nullable(),

    items: z.array(
      z.object({
        id: z.number(),
        menuItemId: z.number(),
        name: z.string(),
        quantity: z.number(),
        unitPriceCents: z.number(),
        lineTotalCents: z.number(),
      })
    ),
  }),
})

export const createOrderBodySchema = z.object({
  customerId: z.number().int().positive().nullable(),

  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
})

export const createOrderResponseSchema = z.object({
  order: z.object({
    id: z.number(),
    customerId: z.number().nullable(),
    status: orderStatusSchema,
    totalCents: z.number(),
    estimatedPrepTimeMinutes: z.number(),
    createdAt: z.string().or(z.date()),
  }),
})

export const customersResponseSchema = z.object({
  customers: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      orderCount: z.number(),
      totalSpendCents: z.number(),
    })
  ),
})
export const createCustomerBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().nullable(),
  phone: z.string().nullable(),
})

export const createCustomerResponseSchema = z.object({
  customer: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    orderCount: z.number(),
    totalSpendCents: z.number(),
  }),
})

export const customerDetailParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
  }),
})

export const customerDetailResponseSchema = z.object({
  customer: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    orderCount: z.number(),
    totalSpendCents: z.number(),

    recentOrders: z.array(
      z.object({
        id: z.number(),
        status: orderStatusSchema,
        totalCents: z.number(),
        createdAt: z.string().or(z.date()),
      })
    ),
  }),
})

export const settingsResponseSchema = z.object({
  settings: orderingSettingsSchema.nullable(),
})

export const updateSettingsBodySchema = z.object({
  restaurantName: z.string().min(1),
  prepTimeMinutes: z
    .number()
    .int()
    .min(1)
    .max(240),
  autoAcceptOrders: z.boolean(),
  orderingEnabled: z.boolean(),
})

export const updateSettingsResponseSchema = z.object({
  settings: orderingSettingsSchema,
})

export const summaryResponseSchema = z.object({
  totalOrders: z.number(),
  revenueCents: z.number(),
  pendingOrders: z.number(),

  popularItems: z.array(
    z.object({
      name: z.string(),
      quantitySold: z.number(),
    })
  ),
})

export const updateOrderStatusParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
  }),
})

export const updateOrderStatusBodySchema = z.object({
  status: orderStatusSchema,
})

export const updateOrderStatusResponseSchema = z.object({
  id: z.number(),
  status: orderStatusSchema,
})