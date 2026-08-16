# Odyssey Restaurant Dashboard


A full-stack restaurant management dashboard built as a monorepo using Expo, React Native Web, Hono, PostgreSQL, Drizzle ORM, OpenAPI, Orval, and React Query.


## Tech Stack


### Frontend
- Expo
- React Native
- React Native Web
- TypeScript
- TanStack React Query
- Orval-generated API client


### Backend
- Hono
- Cloudflare Workers
- PostgreSQL
- Neon
- Drizzle ORM
- drizzle-zod
- Zod OpenAPI


### Monorepo
- pnpm workspaces
- Turborepo


## Project Structure


```text
apps/
  dashboard/          Expo + React Native Web dashboard


services/
  backend/            Hono API running on Cloudflare Workers


packages/
  api-client/         Orval-generated API client and React Query hooks
  shared/             Shared UI components
  types/              Shared type package
Features
Home
Total orders
Revenue
Pending orders
Popular menu items
Orders
Create orders
Guest or registered customer selection
Add menu items and quantities
Server-side price calculation
Server-side prep-time calculation
Order status filtering
Order detail panel
Ordered line items
Estimated prep time
Estimated ready time
Validated status transitions

Supported order statuses:

pending
accepted
preparing
ready
completed
cancelled

Valid transitions are enforced by the backend.

CRM
Customer list
Add customers
Name, email, and phone
Customer order count
Total spend
Order history
Guest order aggregation
Menu
View menu by category
Create menu items
Edit menu items
Edit price
Edit description
Edit category
Per-item preparation time
Toggle availability

Unavailable items cannot be ordered.

Settings
Restaurant name
Auto Accept Orders
Ordering Enabled

When Auto Accept Orders is enabled, new orders start as accepted.

When Ordering Enabled is disabled, new orders are rejected by the backend.

UI Library

Reusable components from the shared design-system package:

Button
Card
StatusBadge
Architecture

The application follows this API/type flow:

PostgreSQL
↓
Drizzle ORM
↓
drizzle-zod
↓
Hono + OpenAPI
↓
OpenAPI specification
↓
Orval
↓
Generated API types/functions/hooks
↓
React Query
↓
Expo dashboard

Frontend API request/response models are generated from the backend OpenAPI contract rather than manually duplicated.

Database

Main tables:

menu_categories
menu_items
customers
orders
order_items
ordering_settings

Order prices and estimated preparation times are calculated on the backend using the current menu item values.

The calculated prep time is stored on the order so historical orders keep their original estimate even if menu prep times are changed later.

Requirements
Node.js
pnpm
PostgreSQL / Neon database
Installation

From the repository root:

pnpm install
Environment Variables

Create:

services/backend/.env

and:

services/backend/.dev.vars

Both require:

DATABASE_URL=your_postgresql_connection_string

Do not commit real environment variables.

Database Setup

From:

cd services/backend

Generate Drizzle migrations:

pnpm exec drizzle-kit generate

Push the schema:

pnpm exec drizzle-kit push

Seed the database:

pnpm db:seed
Running the Backend
cd services/backend
pnpm dev

The backend runs locally at:

http://localhost:8787

OpenAPI specification:

http://localhost:8787/openapi.json
Generate API Client

The backend must be running first.

Then:

cd packages/api-client
pnpm generate

Do not manually edit files inside:

packages/api-client/src/generated
Running the Dashboard
cd apps/dashboard
pnpm exec expo start --web

The web dashboard normally runs at:

http://localhost:8081

If Metro has stale workspace output:

pnpm exec expo start --web --clear
Typecheck

From the repository root:

pnpm turbo typecheck

Or individually:

cd services/backend
pnpm typecheck
cd apps/dashboard
pnpm typecheck
cd packages/api-client
pnpm typecheck
cd packages/shared
pnpm typecheck
Tests

Backend tests use Vitest.

Run:

cd services/backend
pnpm test

Current tests cover important business logic including:

valid order status transitions
invalid order status transitions
cancellation rules
server-side order total calculation
server-side estimated preparation time calculation
missing menu item rejection
Business Rules
Order totals

The frontend sends menu item IDs and quantities.

The backend looks up the actual menu prices and calculates the final total.

The frontend does not control the persisted order total.

Menu availability

Unavailable menu items are rejected when creating an order.

Status transitions

Order status changes are validated by backend business logic.

For example:

pending → accepted
accepted → preparing
preparing → ready
ready → completed

Invalid transitions are rejected.

Auto accept

If enabled:

new order → accepted

Otherwise:

new order → pending
Ordering enabled

If ordering is disabled, the backend rejects new orders.

Shared UI

Reusable components live in:

packages/shared

The dashboard uses shared UI components across multiple screens, while the UI Library page demonstrates the available component variants.

Development Notes

This project intentionally keeps the frontend API layer generated from OpenAPI through Orval.

Generated files should not be manually edited.

Backend business rules are kept server-side rather than trusting client-provided state such as order totals or unrestricted status changes.