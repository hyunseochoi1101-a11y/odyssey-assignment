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
Shared KPI cards
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
Recent order item details with quantities and line prices
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

The UI Library demonstrates reusable components from the shared design-system package:

Button
Card
StatusBadge

These components are also used throughout real application screens.

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

Frontend API request and response models are generated from the backend OpenAPI contract rather than manually duplicated.

Database

Main tables:

menu_categories
menu_items
customers
orders
order_items
ordering_settings

Order prices and estimated preparation times are calculated on the backend using menu item values.

The calculated preparation time is stored on the order so historical orders keep their original estimate even if menu prep times are changed later.

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

From the backend directory:

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

Do not manually edit generated files inside:

packages/api-client/src/generated
Running the Dashboard
cd apps/dashboard
pnpm exec expo start --web

The web dashboard normally runs at:

http://localhost:8081

If Metro has stale workspace output:

pnpm exec expo start --web --clear
Build

From the repository root:

pnpm build

The dashboard web build uses Expo export and outputs the generated web build to:

apps/dashboard/dist
Typecheck

From the repository root:

pnpm typecheck

This runs Turborepo typecheck tasks across the workspace.

You can also run package checks individually.

Backend:

cd services/backend
pnpm typecheck

Dashboard:

cd apps/dashboard
pnpm typecheck

API client:

cd packages/api-client
pnpm typecheck

Shared components:

cd packages/shared
pnpm typecheck
Tests

Backend tests use Vitest.

From the repository root:

pnpm test

Or directly from the backend:

cd services/backend
pnpm test

Tests cover important business logic including:

Valid order status transitions
Invalid order status transitions
Cancellation rules
Server-side order total calculation
Server-side estimated preparation time calculation
Missing menu item rejection

Production backend routes use the same tested business-logic helpers.

Business Rules
Order Totals

The frontend sends menu item IDs and quantities.

The backend looks up the actual menu prices and calculates the final total.

The frontend does not control the persisted order total.

Preparation Time

Each menu item has its own preparation time.

When an order is created, the backend calculates:

sum(prep time × quantity)

and stores the resulting estimated preparation time on the order.

Menu Availability

Unavailable menu items are rejected when creating an order.

Status Transitions

Order status changes are validated by backend business logic.

Examples of valid transitions:

pending → accepted
accepted → preparing
preparing → ready
ready → completed

Active orders can also be cancelled where allowed.

Invalid transitions are rejected by the backend.

Auto Accept

If Auto Accept Orders is enabled:

new order → accepted

Otherwise:

new order → pending
Ordering Enabled

If ordering is disabled, the backend rejects new orders.

Shared UI

Reusable components live in:

packages/shared

The dashboard uses these shared components across real application screens:

Button for primary, secondary, and danger actions
Card for dashboard KPI and content panels
StatusBadge for status display

The UI Library page demonstrates the available shared component variants.

API Client

The frontend API layer is generated with Orval from the backend OpenAPI document.

Generated React Query hooks are used for operations such as:

Fetching the menu
Fetching orders
Fetching order details
Creating orders
Updating order status
Fetching customers
Fetching customer details
Creating customers
Fetching and updating settings
Fetching dashboard summary data
Creating and updating menu items

This keeps frontend API types aligned with the backend contract.

Architecture Decisions

The project is organized as a pnpm/Turborepo monorepo so the dashboard, backend, generated API client, and shared UI can evolve together while remaining independently runnable.

The backend uses Drizzle as the database schema source, drizzle-zod for validation/schema derivation, Hono with OpenAPI for the HTTP contract, and Orval to generate the frontend API client and React Query hooks.

Business-critical behavior is enforced on the server. Order totals, prep-time estimates, menu availability checks, global ordering state, and order status transitions are not trusted to client-provided values.

Shared UI components live in `packages/shared` and are reused across real application screens. The UI Library documents the chosen design tokens, typography, spacing, surfaces, component variants, and common application states.

Tradeoffs / Incomplete Areas

This assignment prioritizes the required restaurant management flows and typed API architecture over production-scale infrastructure.

Some areas that would be expanded in a production system include:

- authentication and authorization
- pagination for large order and customer datasets
- richer automated integration and end-to-end tests
- transaction handling around multi-step order creation
- accessibility and keyboard-navigation refinement
- deployment and CI/CD configuration
- more extensive shared form, modal, and notification primitives

The current implementation is intended to demonstrate the required full-stack architecture, backend business rules, generated API contract, reusable UI, and core restaurant workflows.

Development Notes

The project intentionally keeps important business rules on the server rather than trusting client-provided values.

Examples include:

Order totals are calculated server-side
Preparation estimates are calculated server-side
Unavailable menu items cannot be ordered
Ordering can be disabled globally
Order status transitions are validated by the backend

Generated API files should not be manually edited.

Environment files and local secrets are ignored by Git.