# RateStore Backend API

Complete backend implementation for the RateStore application using Express.js, PostgreSQL (Neon), and Drizzle ORM.

## 📋 Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Full user CRUD operations with role support
- **Store Management**: Complete store listing and management
- **Rating System**: 1-5 star rating system for stores
- **Form Validation**: Server-side validation for all inputs
- **Database**: PostgreSQL with Neon cloud hosting
- **ORM**: Drizzle ORM for database operations
- **Password Security**: Bcrypt password hashing

## 🛠 Tech Stack

- **Backend Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: Node.js

## 📁 Project Structure

```
backend/
├── controllers/              # Business logic
│   ├── authController.js    # Auth operations
│   ├── adminController.js   # Admin operations
│   ├── userController.js    # User operations
│   └── storeController.js   # Store owner operations
├── routes/                   # Route definitions
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── userRoutes.js
│   └── ownerRoutes.js
├── middleware/              # Middleware
│   └── authMiddleware.js    # JWT verification and role checks
├── utils/                   # Utility functions
│   ├── validators.js        # Form validation
│   └── hash.js              # Password hashing
├── drizzle/                 # Database
│   ├── schema.js            # Database schema
│   ├── db.js                # Database connection
│   ├── migrations/          # Migration files
│   └── meta/
├── drizzle.config.js        # Drizzle configuration
├── index.js                 # Server entry point
├── package.json             # Dependencies
├── .env.example             # Environment template
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL or Neon account
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` file**:
   ```env
   DATABASE_URL=postgresql://user:password@neon.tech/database
   JWT_SECRET=your_secret_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Push database schema** (using Drizzle):
   ```bash
   npm run drizzle:push
   ```

   Or using Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

## 📚 API Endpoints

### Authentication

**POST** `/api/auth/register`
- Register new user
- Body: `{ name, email, password, address, role }`

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`

**POST** `/api/auth/change-password`
- Change password (requires authentication)
- Body: `{ oldPassword, newPassword }`

### Admin

**GET** `/api/admin/dashboard`
- Get dashboard statistics
- Role: system_admin

**GET** `/api/admin/users`
- List users with filters
- Query: `?name=...&email=...&role=...&page=1&limit=10&sortBy=name&sortOrder=asc`
- Role: system_admin

**POST** `/api/admin/create-user`
- Create new user
- Body: `{ name, email, password, address, role }`
- Role: system_admin

**GET** `/api/admin/stores`
- List stores with filters
- Query: `?name=...&email=...&address=...&page=1&limit=10&sortBy=name&sortOrder=asc`
- Role: system_admin

**POST** `/api/admin/create-store`
- Create new store
- Body: `{ name, email, address }`
- Role: system_admin

### User

**GET** `/api/stores`
- Get all stores with ratings
- Query: `?search=...&page=1&limit=12`
- Authentication: Optional

**POST** `/api/ratings`
- Submit rating for store
- Body: `{ storeId, rating }`
- Authentication: Required

**PUT** `/api/ratings/:id`
- Update rating
- Body: `{ rating }`
- Authentication: Required

### Store Owner

**GET** `/api/owner/dashboard`
- Get owner dashboard with store ratings
- Query: `?page=1&limit=10`
- Role: store_owner

## 🔐 Authentication

### JWT Token
- Tokens are issued after successful login/registration
- Include in all protected requests as: `Authorization: Bearer <token>`
- Token expires in 7 days
- Stored in frontend localStorage

### Role-Based Access Control
- `system_admin`: Full access to admin endpoints
- `store_owner`: Access to store owner dashboard
- `user`: Standard user access

## ✅ Validation Rules

- **Name**: 20-60 characters
- **Email**: Valid email format, must be unique
- **Password**: 8-16 characters, must include 1 uppercase letter and 1 special character
- **Address**: Maximum 400 characters
- **Rating**: Integer between 1-5

## 📊 Database Schema

### users
- id (Serial)
- name (String, 255)
- email (String, 255, unique)
- password (Text, hashed)
- address (Text)
- role (String: user, store_owner, system_admin)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### stores
- id (Serial)
- name (String, 255)
- email (String, 255, unique)
- address (Text)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### ratings
- id (Serial)
- userId (Integer, FK to users)
- storeId (Integer, FK to stores)
- rating (Integer, 1-5)
- createdAt (Timestamp)
- updatedAt (Timestamp)
- Unique constraint on (userId, storeId)

## 🔧 Drizzle ORM Commands

```bash
# Push schema to database
npm run drizzle:push

# Create new migration
npx drizzle-kit generate

# View database in Drizzle Studio
npx drizzle-kit studio

# Check migration status
npx drizzle-kit status
```

## 🧪 Testing Endpoints

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "user@example.com",
    "password": "User@123",
    "address": "789 User Road, User City",
    "role": "user"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User@123"
  }'
```

**Get Stores**:
```bash
curl http://localhost:5000/api/stores
```

### Using Postman

1. Create collection "RateStore Backend"
2. Set base URL: `http://localhost:5000/api`
3. Create environment variable `token` for JWT
4. Test endpoints with appropriate headers and body

## 📝 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid credentials or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## 🚨 Troubleshooting

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check Neon console for connection string
- Ensure SSL mode is disabled or configured

### JWT Token Expired
- Users need to login again
- Frontend should handle 401 errors

### Validation Errors
- Check all required fields are provided
- Verify field lengths and formats match requirements
- Check password complexity (uppercase + special char)

### CORS Issues
- Verify FRONTEND_URL in .env
- Check request origin matches CORS configuration
- Ensure credentials if needed

## 📦 Dependencies

```json
{
  "express": "Latest Express server",
  "drizzle-orm": "TypeScript ORM",
  "pg": "PostgreSQL client",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "cors": "CORS handling",
  "dotenv": "Environment variables"
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit .env file
2. **Password Hashing**: All passwords hashed with bcrypt
3. **JWT Secret**: Use strong secret in production
4. **HTTPS**: Use HTTPS in production
5. **Input Validation**: All inputs validated server-side
6. **CORS**: Configured for frontend only
7. **SQL Injection**: Protected by Drizzle ORM

## 🌐 Neon PostgreSQL Setup

### Creating a Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create new project
3. Select PostgreSQL version
4. Copy connection string
5. Add to `.env` as DATABASE_URL

### Connection String Format
```
postgresql://username:password@hostname/database_name?sslmode=require
```

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Docs](https://neon.tech/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test endpoints
4. Submit PR

## 📄 License

This project is part of the FullStack Intern Coding Challenge.

---

**Last Updated**: April 9, 2026
**Version**: 1.0.0
**Status**: Production Ready
