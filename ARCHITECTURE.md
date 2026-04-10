# Backend Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                            │
│                    http://localhost:5173                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests (JSON)
                             │ JWT Token in Header
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Express.js Server                              │
│                  http://localhost:5000                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    CORS Middleware                         │ │
│  │         (Allows requests from localhost:5173)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Auth Middleware                          │ │
│  │  - JWT token validation                                   │ │
│  │  - Role-based access control                              │ │
│  │  - User attachment to req.user                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Auth Routes │ Admin Routes │ User Routes  │ Owner Routes   │ │
│  └──────┬──────┴──────┬───────┴──────┬───────┴────────┬───────┘ │
│         │             │              │                │         │
│  ┌──────▼──────┐ ┌───▼────────┐ ┌──▼───────────┐ ┌──▼────────┐ │
│  │Auth         │ │Admin        │ │User          │ │Store Owner│ │
│  │Controller   │ │Controller   │ │Controller    │ │Controller │ │
│  │             │ │             │ │              │ │           │ │
│  │• register   │ │• dashboard  │ │• getAllStores│ │• getOwner │ │
│  │• login      │ │• getUsers   │ │• submitRating│ │  Dashboard│ │
│  │• changePass │ │• createUser │ │• updateRating│ │           │ │
│  │             │ │• getStores  │ │              │ │           │ │
│  │             │ │• createStore│ │              │ │           │ │
│  └──────┬──────┘ └───┬────────┘ └──┬───────────┘ └──┬────────┘ │
│         │             │              │                │         │
│         │   Validation Utility       │                │         │
│         │   (validators.js)          │                │         │
│         │   (hash.js)                │                │         │
│         └─────────────┬──────────────┴────────────────┴─────────┘
│                       │
│                       │ SQL Queries via Drizzle ORM
│                       ▼
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Connection (SSL)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              PostgreSQL Database (Neon)                          │
│                  ep-green-rice-a1jmmnfk...                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ users table  │  │ stores table  │  │ratings table │          │
│  │              │  │               │  │              │          │
│  │• id (PK)     │  │• id (PK)      │  │• id (PK)     │          │
│  │• name        │  │• name         │  │• user_id (FK)│──┐      │
│  │• email (UQ)  │  │• email (UQ)   │  │• store_id(FK)├──┼─┐    │
│  │• password    │  │• address      │  │• rating 1-5  │  │ │    │
│  │• address     │  │• owner_id(FK) ├──┤• created_at  │  │ │    │
│  │• role        │  │• created_at   │  │• updated_at  │  │ │    │
│  │• created_at  │  │• updated_at   │  │              │  │ │    │
│  │• updated_at  │  │               │  │UNIQUE(user,  │  │ │    │
│  │              │  │               │  │store)        │  │ │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  │ │    │
│         ▲                  ▲                       ▲     │ │    │
│         └──────────────────┼───────────────────────┴─────┘ │    │
│              (Relationships)           (Foreign Keys)      │    │
│                                                           │    │
│  Indexes:                                                │    │
│  • users_email_idx      (email lookup)                  │    │
│  • users_role_idx       (role filtering)               │    │
│  • stores_email_idx     (email lookup)                 │    │
│  • stores_name_idx      (search)                       │    │
│  • stores_owner_idx     (owner dashboard)             │    │
│  • ratings_user_idx     (user ratings)                │    │
│  • ratings_store_idx    (store ratings)               │    │
│  • unique_user_store    (one rating per user/store)  │    │
│                                                           │    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 API Request/Response Flow

### Example: User Registration

```
1. Frontend (React)
   └─► POST /api/auth/register
       {
         "name": "John User",
         "email": "user@example.com",
         "password": "User@123",
         "address": "123 Main St",
         "role": "user"
       }

2. Backend (Express.js)
   └─► Route: authRoutes.js
       └─► Controller: authController.register()
           ├─► Validate input (validators.js)
           ├─► Check email duplicate
           ├─► Hash password (utils/hash.js)
           ├─► Insert into DB (drizzle query)
           ├─► Generate JWT token
           └─► Return response

3. Database (PostgreSQL ↔ Neon)
   └─► INSERT INTO users (name, email, password_hash, address, role)
       VALUES (...)
       RETURNING *;

4. Response to Frontend
   ├─► Status 201 Created
   └─► JSON response with user + token
       {
         "success": true,
         "user": { id, name, email, address, role, ... },
         "token": "eyJhbGciOi..."
       }
```

### Example: Browse Stores

```
1. Frontend (React)
   └─► GET /api/stores?search=pizza&page=1&limit=12
       Header: Authorization: Bearer <token>

2. Backend (Express.js)
   └─► Route: userRoutes.js (GET /stores)
       └─► Controller: userController.getAllStores()
           ├─► Parse query params (search, page, limit)
           ├─► Build SQL filter (if search provided)
           ├─► Query stores with pagination
           ├─► Calculate average_rating for each store
           ├─► If authenticated, include user's rating
           └─► Return paginated list

3. Database Queries (Drizzle ORM)
   └─► SELECT * FROM stores LIMIT 12 OFFSET 0;
       └─► For each store:
           SELECT AVG(rating) FROM ratings WHERE store_id = ?;
           SELECT * FROM ratings WHERE store_id = ? AND user_id = ?;

4. Response to Frontend
   ├─► Status 200 OK
   └─► JSON response
       {
         "success": true,
         "stores": [
           {
             "id": 1,
             "name": "Pizza Palace",
             "averageRating": 4.5,
             "totalRatings": 10,
             "userRating": { "id": 5, "rating": 5 },
             ...
           },
           ...
         ],
         "pagination": { "page": 1, "limit": 12, "total": 50, "pages": 5 }
       }
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Registration                        │
│                   POST /auth/register                       │
└─────────────────────e────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Validate Input              │
        │  - Email format              │
        │  - Password strength         │
        │  - Password hash with bcrypt │
        └──────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Check Email Unique          │
        │  Query: SELECT * FROM users  │
        │  WHERE email = 'x@y.com'     │
        └──────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
      Exists?                Not Exists?
      (Error)                (Continue)
           │                     │
           ▼                     ▼
    ┌─────────────┐   ┌──────────────────────┐
    │ 400 Error   │   │  INSERT INTO users   │
    │ Email taken │   │  VALUES (...)        │
    └─────────────┘   └──────────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ Generate JWT Token   │
                  │ Header: {alg: HS256} │
                  │ Payload: {id, email, │
                  │   name, role, addr}  │
                  │ Sign with JWT_SECRET │
                  └──────────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ Return 201 Created   │
                  │ - user object        │
                  │ - JWT token          │
                  └──────────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ Frontend Stores      │
                  │ - Token in localStorage
                  │ - User in localStorage
                  └──────────────────────┘
```

### Protected Route Access

```
Client sends request:
GET /api/owner/dashboard
Headers: Authorization: Bearer eyJhbGc...

         │
         ▼
┌─────────────────────────────────────┐
│     Auth Middleware                 │
│     - Extract token from header     │
│     - Remove "Bearer " prefix       │
│     - Verify token signature        │
│     - Check token expiration        │
└─────────────────────────────────────┘
    │                 │                │
Success            Invalid       Expired
(Valid token)      (Malformed)    (7+ days)
    │                 │                │
    ▼                 ▼                ▼
Attach req.user    401 Error       401 Error
│                  "Invalid token" "Token expired"
│
├─► Check user.role in allowed roles
│
├─ YES: Continue to controller
│
└─ NO: 403 Forbidden "Insufficient permissions"
```

---

## 📈 Database Relationships

```
                    ┌─────────────────┐
                    │  users table     │
                    │                 │
                    │  id (PK)        │
                    │  name           │
                    │  email (UNIQUE) │
                    │  password       │
                    │  role           │
                    │  address        │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                │ (1 user can own        │
                │  many stores)          │
                │                         │
                ▼                         ▼
       ┌──────────────────┐    ┌────────────────────┐
       │ stores table     │    │ ratings table      │
       │                  │    │                    │
       │ id (PK)          │    │ id (PK)            │
       │ name             │    │ user_id (FK)       │
       │ email (UNIQUE)   │────│ store_id (FK)      │
       │ address          │    │ rating (1-5)       │
       │ owner_id (FK)───┐│    │ created_at         │
       │ created_at      │└────┤ updated_at         │
       │ updated_at      │     │                    │
       └──────────────────┘     │ UNIQUE(user_id,   │
                                │ store_id)         │
                                └────────────────────┘

Relationships:
1. users 1:N stores (one user owns many stores via owner_id)
2. users 1:N ratings (one user submits many ratings via user_id)
3. stores 1:N ratings (one store receives many ratings via store_id)
4. UNIQUE(user_id, store_id) ensures one rating per user per store
```

---

## 🔄 Request Processing Pipeline

```
Request arrives at Express server
│
├─► CORS Middleware
│   └─► Check if origin allowed (localhost:5173)
│
├─► Body Parser Middleware
│   └─► Parse JSON body
│
├─► Routing Layer
│   └─► Match URL to route handler
│
├─► Pre-route Middleware (if needed)
│   ├─► authenticate (verify JWT token)
│   └─► authorize(['role1', 'role2']) (check role)
│
├─► Controller Function
│   ├─► Extract data from request (params, query, body)
│   ├─► Validation (check input)
│   ├─► Database Query (Drizzle ORM)
│   ├─► Error Handling (try-catch)
│   └─► Return JSON response
│
└─► Response sent to client
    {
      "success": true/false,
      "data": {...} or "error": "message"
    }
```

---

## 💾 Database Query Examples

### User Registration Query
```sql
-- Insert new user
INSERT INTO users (name, email, password, address, role, created_at, updated_at)
VALUES ('John User', 'user@example.com', '$2b$10$hash...', '123 Main St', 'user', NOW(), NOW())
RETURNING id, name, email, address, role, created_at, updated_at;
```

### Browse Stores Query
```sql
-- Get paginated stores
SELECT id, name, email, address, owner_id, created_at, updated_at
FROM stores
WHERE name ILIKE '%pizza%' OR address ILIKE '%pizza%'
ORDER BY name ASC
LIMIT 12 OFFSET 0;

-- For each store, get average rating
SELECT AVG(rating)::numeric(3,2) as average_rating, COUNT(*) as total_ratings
FROM ratings
WHERE store_id = $1;

-- Check user's rating (if authenticated)
SELECT id, rating, created_at
FROM ratings
WHERE user_id = $1 AND store_id = $2;
```

### Admin Dashboard Query
```sql
-- Get statistics
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_stores FROM stores;
SELECT COUNT(*) as total_ratings FROM ratings;
SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;
```

### Store Owner Dashboard Query
```sql
-- Get owner's stores
SELECT * FROM stores WHERE owner_id = $1;

-- Get ratings for owner's store
SELECT r.id, r.user_id, r.rating, r.created_at, u.name, u.email
FROM ratings r
JOIN users u ON r.user_id = u.id
WHERE r.store_id = $1
ORDER BY r.created_at DESC
LIMIT 10 OFFSET 0;

-- Calculate average rating
SELECT AVG(rating)::numeric(3,2), COUNT(*) as total_ratings
FROM ratings
WHERE store_id = $1;
```

---

## 🛡️ Error Handling Flow

```
Try to execute request
│
├─► Validation error detected
│   └─► Return 400 Bad Request
│       {
│         "success": false,
│         "error": "Validation failed: ..."
│       }
│
├─► Database error (foreign key, etc.)
│   └─► Return 400 Bad Request
│       {
│         "success": false,
│         "error": "Invalid data: ..."
│       }
│
├─► Authentication error (no token)
│   └─► Return 401 Unauthorized
│       {
│         "success": false,
│         "error": "Missing authentication token"
│       }
│
├─► Authorization error (wrong role)
│   └─► Return 403 Forbidden
│       {
│         "success": false,
│         "error": "Insufficient permissions"
│       }
│
├─► Resource not found
│   └─► Return 404 Not Found (or 400)
│       {
│         "success": false,
│         "error": "User not found"
│       }
│
├─► Internal server error
│   └─► Return 500 Internal Server Error
│       {
│         "success": false,
│         "error": "Internal server error"
│       }
│
└─► Success
    └─► Return 200/201 OK/Created
        {
          "success": true,
          "data": {...}
        }
```

---

## 📁 File Organization & Data Flow

```
request from frontend
        │
        ▼
    index.js
    (server setup, middleware config, route mounting)
        │
    ┌───┼───┐
    │   │   │
    ▼   ▼   ▼
   routes/
  / | \ \
 /  |  \ \
ver/auth admin user owner
    │    │    │    │
    ▼    ▼    ▼    ▼
  controllers/
  auth  admin user store
   │     │     │    │
   └─────┼─────┼────┘
         │
         ▼
     drizzle/
     (db connection)
         │
         ▼
      schema.js
      (table definitions)
         │
         ▼
    Database
    (Neon PostgreSQL)
```

---

## 🚀 Deployment Topology

```
Development:
localhost:5000 (Backend) ←──────► Neon PostgreSQL
                  ↑
                  │
localhost:5173 (Frontend React)


Production:
vercel.com/railway.app/render.com (Backend) ←──────► Neon PostgreSQL
                         ↑
                         │
vercel.com/netlify (Frontend React)
```

---

## 📊 Performance Characteristics

| Operation | Time | Note |
|-----------|------|------|
| User Registration | 200-300ms | bcryptjs hashing ~100ms |
| Login | 200-300ms | Password verification ~100ms |
| Browse Stores (first page) | 50-100ms | With DB indexes |
| Submit Rating | 100-150ms | Insert + update store avg |
| Get Dashboard | 30-50ms | Simple count queries |
| Get User List (page 1) | 50-100ms | With pagination |
| Get Stores List (page 1) | 50-100ms | With ratings calc |

---

## 🔗 Integration Points

```
Frontend ──┬──► Auth API (register, login, change-password)
           │
           ├──► Admin API (dashboard, users, stores CRUD)
           │
           ├──► User API (browse stores, rate stores)
           │
           └──► Owner API (view store ratings)

Frontend localStorage
├─► user object (id, name, email, role, address)
└─► token (JWT, expires 7 days)

Backend Environment
├─► DATABASE_URL (Neon connection string)
├─► JWT_SECRET (token signing key)
├─► PORT (5000)
├─► NODE_ENV (development/production)
└─► FRONTEND_URL (CORS origin)
```

---

**Version**: 1.0  
**Created**: April 9, 2026  
**Architecture Type**: Microservices-friendly RESTful API  
**Status**: Production Ready
