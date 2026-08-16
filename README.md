# Odyssey Restaurant Dashboard

A full-stack restaurant management dashboard built as a pnpm/Turborepo monorepo using Expo, React Native Web, Hono, PostgreSQL, Drizzle ORM, OpenAPI, Orval, and React Query.

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

### Monorepo / Tooling
- pnpm workspaces
- Turborepo
- ESLint
- Vitest

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
```

## Features

### Home
- Total orders
- Revenue
- Pending orders
- Popular menu items
- Shared Card components for KPI and content panels

### Orders
- Create orders
- Guest or registered customer selection
- Add menu items and quantities
- Server-side price calculation
- Server-side prep-time calculation
- Order status filtering
- Order detail panel
- Ordered line items
- Estimated prep time
- Estimated ready time
- Validated order status transitions
- Order-created success feedback

Supported order statuses:

```text
pending
accepted
preparing
ready
completed
cancelled
```

Valid transitions are enforced by the backend.

### CRM
- Customer list
- Add customers
- Name, email, and phone
- Customer order count
- Total spend
- Customer order history
- Recent order item details
- Item quantities
- Item line prices
- Guest order aggregation

### Menu
- View menu by category
- Create menu items
- Edit menu items
- Edit price
- Edit description
- Edit category
- Per-item preparation time
- Toggle availability

Unavailable items cannot be ordered.

### Settings
- Restaurant name
- Auto Accept Orders
- Ordering Enabled
- Save-success feedback
- Warning when ordering is disabled

When Auto Accept Orders is enabled, new orders start as `accepted`.

When Ordering Enabled is disabled, new orders are rejected by the backend.

### UI Library

The UI Library documents and demonstrates:

- Color tokens
- Typography values
- Spacing scale
- Surface styles
- Primary, secondary, danger, and disabled button states
- Order status badges
- Loading states
- Empty states
- Success states
- Warning states
- Error states

Shared components are also used in real application screens rather than only inside the UI Library.

## Architecture

The application follows this API and type flow:

```text
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
```

Frontend API request and response types are generated from the backend OpenAPI contract instead of being manually duplicated.

## Database

Main tables:

```text
menu_categories
menu_items
customers
orders
order_items
ordering_settings
```

Order prices and estimated preparation times are calculated on the backend using menu item values.

The calculated preparation time is stored on the order so historical orders keep their original estimate even if menu preparation times are changed later.

## Requirements

- Node.js
- pnpm
- PostgreSQL / Neon database

## Installation

From the repository root:

```bash
pnpm install
```

## Environment Variables

Create:

```text
services/backend/.env
```

and:

```text
services/backend/.dev.vars
```

Both require:

```env
DATABASE_URL=your_postgresql_connection_string
```

Do not commit real environment variables.

## Database Setup

Move into the backend directory:

```bash
cd services/backend
```

Generate Drizzle migrations:

```bash
pnpm exec drizzle-kit generate
```

Push the schema:

```bash
pnpm exec drizzle-kit push
```

Seed the database:

```bash
pnpm db:seed
```

## Root Commands

The repository exposes convenience scripts for the main development workflows.

Run the dashboard:

```bash
pnpm dev:dashboard
```

Run the backend:

```bash
pnpm dev:backend
```

Generate the API contract/client:

```bash
pnpm gen:contract
```

Lint:

```bash
pnpm lint
```

Typecheck:

```bash
pnpm typecheck
```

Run tests:

```bash
pnpm test
```

Build:

```bash
pnpm build
```

## Running the Backend

From the repository root:

```bash
pnpm dev:backend
```

Or directly:

```bash
cd services/backend
pnpm dev
```

The backend runs locally at:

```text
http://localhost:8787
```

OpenAPI specification:

```text
http://localhost:8787/openapi.json
```

## Generate API Client

The backend must be running first.

From the repository root:

```bash
pnpm gen:contract
```

Or directly:

```bash
cd packages/api-client
pnpm generate
```

Do not manually edit generated files inside:

```text
packages/api-client/src/generated
```

## Running the Dashboard

From the repository root:

```bash
pnpm dev:dashboard
```

Or directly:

```bash
cd apps/dashboard
pnpm exec expo start --web
```

The web dashboard normally runs at:

```text
http://localhost:8081
```

If Metro has stale workspace output:

```bash
pnpm exec expo start --web --clear
```

## Build

From the repository root:

```bash
pnpm build
```

The dashboard web build uses Expo export.

Generated web output is written to:

```text
apps/dashboard/dist
```

## Lint

From the repository root:

```bash
pnpm lint
```

ESLint checks the application and backend source maintained in the repository while generated Orval output is excluded.

## Typecheck

From the repository root:

```bash
pnpm typecheck
```

This runs Turborepo typecheck tasks across the workspace.

Individual package checks can also be run.

Backend:

```bash
cd services/backend
pnpm typecheck
```

Dashboard:

```bash
cd apps/dashboard
pnpm typecheck
```

API client:

```bash
cd packages/api-client
pnpm typecheck
```

Shared components:

```bash
cd packages/shared
pnpm typecheck
```

## Tests

Tests use Vitest.

Run the full test suite from the repository root:

```bash
pnpm test
```

### Backend tests

Backend tests cover business logic including:

- Valid order status transitions
- Invalid order status transitions
- Cancellation rules
- Server-side order total calculation
- Server-side estimated preparation time calculation
- Missing menu item rejection

Production backend routes use the same tested business-logic helpers.

### Frontend tests

The dashboard also includes frontend utility coverage, including currency formatting behavior.

This provides lightweight frontend test coverage without coupling tests to implementation details of React Native rendering.

## Business Rules

### Order Totals

The frontend sends menu item IDs and quantities.

The backend looks up the actual menu prices and calculates the final persisted total.

The frontend does not control the saved order total.

### Preparation Time

Each menu item has its own preparation time.

When an order is created, the backend calculates:

```text
sum(prep time × quantity)
```

and stores the resulting estimated preparation time on the order.

### Menu Availability

Unavailable menu items are rejected when creating an order.

### Status Transitions

Order status changes are validated by backend business logic.

Examples of valid transitions:

```text
pending → accepted
accepted → preparing
preparing → ready
ready → completed
```

Active orders can also be cancelled where allowed.

Invalid transitions are rejected by the backend.

### Auto Accept

If Auto Accept Orders is enabled:

```text
new order → accepted
```

Otherwise:

```text
new order → pending
```

### Ordering Enabled

If ordering is disabled, the backend rejects new orders.

The Settings screen also displays a warning to make this state clear to the operator.

## Shared UI

Reusable UI components live in:

```text
packages/shared
```

The dashboard currently reuses:

- `Button`
- `Card`
- `StatusBadge`

Examples of real usage include:

- Primary actions such as creating and progressing orders
- Secondary actions such as closing a workflow
- Danger actions such as cancelling an order
- Home KPI and content cards
- Order and menu status display

## API Client

The frontend API layer is generated with Orval from the backend OpenAPI document.

Generated React Query hooks are used for operations including:

- Fetching the menu
- Creating menu items
- Updating menu items
- Updating menu availability
- Updating menu preparation time
- Fetching orders
- Fetching order details
- Creating orders
- Updating order status
- Fetching customers
- Fetching customer details
- Creating customers
- Fetching settings
- Updating settings
- Fetching dashboard summary data

This keeps frontend API types aligned with the backend contract.

## Architecture Decisions

The project is organized as a pnpm/Turborepo monorepo so the dashboard, backend, generated API client, and shared UI can evolve together while remaining independently runnable.

The backend uses Drizzle as the database schema source, drizzle-zod for validation/schema derivation, Hono with OpenAPI for the HTTP contract, and Orval to generate the frontend API client and React Query hooks.

Business-critical behavior is enforced on the server. Order totals, preparation-time estimates, menu availability checks, global ordering state, and order status transitions are not trusted to client-provided values.

Order totals and preparation estimates are stored as historical snapshots. This means later changes to menu prices or preparation times do not rewrite previous order history.

Shared UI components live in `packages/shared` and are reused across real application screens. The UI Library documents the chosen visual values, typography, spacing, surfaces, component variants, and common application states.

## Tradeoffs / Incomplete Areas

This assignment prioritizes the required restaurant-management workflows and typed API architecture over production-scale infrastructure.

Areas that would be expanded in a production system include:

- Authentication and authorization
- Pagination for large order and customer datasets
- Broader automated integration and end-to-end testing
- Transaction handling around multi-step order creation
- Accessibility and keyboard-navigation refinement
- Deployment and CI/CD configuration
- More extensive shared form-control primitives
- Reusable select/dropdown primitives
- Reusable modal/dialog primitives
- Dedicated skeleton components
- Dedicated toast/notification primitives
- Fully centralized design-token definitions shared across all components

The current UI Library documents the selected design values, but those values are not yet fully centralized into a dedicated token package.

The current implementation is intended to demonstrate the required full-stack architecture, backend business rules, generated API contract, reusable UI patterns, and core restaurant workflows.

## Development Notes

Important business rules are intentionally kept on the server rather than trusting client-provided values.

Examples include:

- Order totals are calculated server-side
- Preparation estimates are calculated server-side
- Unavailable menu items cannot be ordered
- Ordering can be disabled globally
- Order status transitions are validated by the backend

Generated API files should not be manually edited.

Environment files and local secrets are ignored by Git.