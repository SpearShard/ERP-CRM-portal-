# Mini ERP-CRM System

A full-stack ERP-CRM application built with Next.js, React, TypeScript, Express.js, PostgreSQL, and Prisma.

The application provides authentication, customer management, product and inventory management, stock movements, follow-ups, challan management, and dashboard statistics.

## Features

### Authentication

- User login
- JWT-based authentication
- Protected API routes
- User roles:
  - ADMIN
  - SALES
  - WAREHOUSE
  - ACCOUNTS
- Authenticated user profile endpoint

### Customer Management

- Create and manage customers
- Customer types:
  - RETAIL
  - WHOLESALE
  - DISTRIBUTOR
- Customer statuses:
  - LEAD
  - ACTIVE
  - INACTIVE
- GST number and business details
- Customer follow-up dates
- Notes and contact information

### Follow-ups

- Create customer follow-ups
- Add follow-up notes
- Set follow-up dates
- Associate follow-ups with customers and users

### Product Management

- Create and manage products
- Unique SKU
- Product categories
- Unit pricing
- Warehouse information
- Current stock tracking
- Minimum stock levels

### Inventory / Stock Management

- Stock IN movements
- Stock OUT movements
- Stock validation before removing inventory
- Automatic stock updates
- Stock movement history
- Record movement reason and responsible user
- Transaction-based stock updates

### Challan Management

- Create challans
- Associate challans with customers
- Add products and quantities
- Challan statuses:
  - DRAFT
  - CONFIRMED
  - CANCELLED
- Automatic total quantity tracking
- Product information snapshot stored with challan items

### Dashboard

- Total customers
- Total products
- Total challans
- Low-stock product count

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Zod
- CORS

## Project Structure

    mini-erp-crm/
    ├── backend/
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   │
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── generated/
    │   │   ├── middleware/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   ├── utils/
    │   │   └── validators/
    │   │
    │   └── package.json
    │
    └── frontend/
        ├── app/
        │   ├── dashboard/
        │   └── login/
        │
        ├── lib/
        │   └── api.ts
        │
        └── public/

## Backend Structure

    backend/src/
    ├── config/
    │   └── database.ts
    │
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── challan.controller.ts
    │   ├── customer.controller.ts
    │   ├── dashboard.controller.ts
    │   ├── followup.controller.ts
    │   ├── product.controller.ts
    │   └── stock.controller.ts
    │
    ├── generated/
    │   └── prisma/
    │
    ├── middleware/
    │   └── auth.middleware.ts
    │
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── challan.routes.ts
    │   ├── customer.routes.ts
    │   ├── dashboard.routes.ts
    │   ├── followup.routes.ts
    │   ├── product.routes.ts
    │   └── stock.routes.ts
    │
    ├── services/
    ├── utils/
    └── validators/

## Frontend Structure

    frontend/
    ├── app/
    │   ├── dashboard/
    │   └── login/
    │
    ├── lib/
    │   └── api.ts
    │
    └── public/

## Database Design

The application uses PostgreSQL with Prisma ORM.

Main entities:

- User
- Customer
- FollowUp
- Product
- StockMovement
- Challan
- ChallanItem

### Relationships

    User
     ├── FollowUps
     ├── StockMovements
     └── Challans

    Customer
     ├── FollowUps
     └── Challans

    Product
     ├── StockMovements
     └── ChallanItems

    Challan
     └── ChallanItems

## Database Models

### User

Stores application users and their roles.

- id
- name
- email
- password
- role
- createdAt
- updatedAt

### Customer

Stores customer and business information.

- id
- name
- mobile
- email
- businessName
- gstNumber
- type
- address
- status
- followUpDate
- notes
- createdAt
- updatedAt

### FollowUp

Stores customer follow-up records.

- id
- customerId
- createdById
- note
- followUpDate
- createdAt

### Product

Stores inventory items.

- id
- name
- sku
- category
- unitPrice
- currentStock
- minimumStock
- warehouse
- createdAt
- updatedAt

### StockMovement

Records inventory changes.

- id
- productId
- quantity
- type
- reason
- createdById
- createdAt

### Challan

Stores delivery challans.

- id
- challanNumber
- customerId
- status
- totalQuantity
- createdById
- createdAt
- updatedAt

### ChallanItem

Stores individual products inside a challan.

- id
- challanId
- productId
- productName
- sku
- unitPrice
- quantity

## API Structure

The backend exposes REST APIs under:

    /api

### Authentication

    POST /api/auth/login
    GET /api/auth/me

### Customers

    /api/customers

### Products

    /api/products

### Follow-ups

    /api/...

### Stock

    /api/...

### Challans

    /api/challans

### Dashboard

    /api/dashboard

### Health Check

    GET /api/health

Example response:

    {
      "success": true,
      "message": "ERP API is running"
    }

## Authentication Flow

The application uses JWT-based authentication.

    User
      ↓
    Login Form
      ↓
    POST /api/auth/login
      ↓
    Backend validates credentials
      ↓
    Password verified using bcrypt
      ↓
    JWT generated
      ↓
    Token returned to frontend
      ↓
    Token stored by frontend
      ↓
    Token sent with protected API requests

Protected requests use:

    Authorization: Bearer <token>

## Environment Variables

### Backend

Create a `.env` file inside the `backend` directory:

    PORT=5000
    DATABASE_URL=your_postgresql_connection_string
    DIRECT_URL=your_direct_postgresql_connection_string
    JWT_SECRET=your_secure_jwt_secret

The JWT secret should be a strong, private value and should not be committed to GitHub.

### Frontend

The frontend API configuration is located at:

    frontend/lib/api.ts

The API client connects the frontend to the deployed backend API.

## Running Locally

### 1. Clone the repository

    git clone https://github.com/SpearShard/ERP-CRM-portal-.git
    cd ERP-CRM-portal-

### 2. Install backend dependencies

    cd backend
    npm install

### 3. Configure environment variables

Create:

    backend/.env

Add the required PostgreSQL and JWT configuration.

### 4. Generate Prisma Client

    npx prisma generate

### 5. Run the backend

For development:

    npm run dev

The backend runs on:

    http://localhost:5000

### 6. Install frontend dependencies

Open another terminal:

    cd frontend
    npm install

### 7. Run the frontend

    npm run dev

The frontend will be available at:

    http://localhost:3000

## Production Deployment

### Backend

The backend is deployed using Render.

Build command:

    npm install && npx prisma generate && npm run build

Start command:

    npm start

### Frontend

The frontend is deployed using Vercel.

### Database

The application uses PostgreSQL as its production database.

## Project Architecture

    ┌──────────────────┐
    │     Frontend     │
    │     Next.js      │
    └────────┬─────────┘
             │
             │ REST API
             ▼
    ┌──────────────────┐
    │      Backend     │
    │ Express + Node   │
    └────────┬─────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
    ┌────────┐  ┌──────────────┐
    │ Prisma │  │ JWT / Auth   │
    │  ORM   │  │  Middleware  │
    └───┬────┘  └──────────────┘
        │
        ▼
    ┌──────────────┐
    │  PostgreSQL  │
    └──────────────┘

## Key Design Decisions

### Prisma ORM

Prisma provides type-safe database access and simplifies database queries and relationships.

### JWT Authentication

JWT is used to authenticate requests between the frontend and backend.

### Role-Based Users

Users can be assigned different roles depending on their responsibilities within the ERP system:

- ADMIN
- SALES
- WAREHOUSE
- ACCOUNTS

### Transaction-Based Stock Updates

Stock movements use database transactions so that updating the product stock and creating the corresponding stock movement happen together.

This helps prevent inconsistent inventory data.

### Product Snapshot in Challans

ChallanItem stores product name, SKU, and unit price in addition to the product relationship.

This preserves the product information associated with the challan even if the product's details are changed later.

## Security

The application includes:

- Password hashing using bcrypt
- JWT authentication
- Protected API routes
- Environment variables for secrets
- Input validation
- CORS configuration
- Database relationships and constraints

Sensitive values such as database credentials and JWT secrets should never be committed to the repository.

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL

## Health Check

The backend provides a health check endpoint:

    GET /api/health

A successful response confirms that the Express API is running.

## Application Workflow

    Authentication
          ↓
    Customers
          ↓
    Follow-ups
          ↓
    Products
          ↓
    Inventory
          ↓
    Stock Movements
          ↓
    Challans
          ↓
    Dashboard

## Conclusion

This project implements a full-stack mini ERP-CRM system designed to manage customers, products, inventory, follow-ups, challans, users, and business-related workflows.

The system uses a modular architecture with a Next.js frontend, Express.js backend, Prisma ORM, and PostgreSQL database. It also includes JWT authentication, password hashing, protected routes, transactional stock management, and production deployment through Vercel and Render.
